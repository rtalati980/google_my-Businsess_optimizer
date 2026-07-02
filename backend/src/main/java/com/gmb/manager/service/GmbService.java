package com.gmb.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gmb.manager.entity.*;
import com.gmb.manager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmbService {

    private final BusinessRepository businessRepository;
    private final LocationRepository locationRepository;
    private final ReviewRepository reviewRepository;
    private final CompetitorRepository competitorRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PostRepository postRepository;
    private final SEOAuditRepository seoAuditRepository;
    private final AIReportRepository aiReportRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final SubscriptionRepository subscriptionRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.gmb.api-mode:PRODUCTION}")
    private String apiMode;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    private static final String GMB_ACCOUNTS_URL =
            "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
    private static final String GMB_LOCATIONS_URL =
            "https://mybusinessbusinessinformation.googleapis.com/v1/%s/locations" +
            "?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,categories";
    private static final String GMB_REVIEWS_BASE_URL =
            "https://mybusiness.googleapis.com/v4/%s/reviews?pageSize=50";

    public List<Business> connectAndSyncGmb(User userParam) {
        log.info("Connecting GMB in {} mode for user {}", apiMode, userParam.getEmail());

        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userParam.getId()));

        List<Business> existing = businessRepository.findByUserId(user.getId());
        if (!existing.isEmpty()) {
            return existing;
        }

        if (user.getGoogleAccessToken() == null) {
            throw new RuntimeException("Google Access Token is missing for user: " + user.getEmail() +
                    ". Please re-authenticate with Google.");
        }
        return connectRealGmb(user);
    }

    public void syncReviews(String locationId) {
        log.info("Syncing reviews for location {} in {} mode", locationId, apiMode);
        locationRepository.findById(locationId).ifPresent(location -> {
            // Look up user via business
            Business business = businessRepository.findById(location.getBusinessId())
                    .orElse(null);
            if (business == null) {
                log.warn("Business not found for location {}", locationId);
                return;
            }
            User user = userRepository.findById(business.getUserId()).orElse(null);
            if (user == null) {
                log.warn("User not found for business {}", business.getId());
                return;
            }
            String token = ensureFreshToken(user);
            if (token != null) {
                syncRealReviews(location, business, token);
            } else {
                log.warn("Cannot sync reviews for location {} because access token is missing.", location.getId());
            }
        });
    }

    /**
     * Attempts to refresh the Google access token using the stored refresh token.
     * Falls back to existing access token if refresh fails or no refresh token is stored.
     */
    public String ensureFreshToken(User user) {
        if (user.getGoogleAccessToken() == null) return null;
        if (user.getGoogleRefreshToken() != null) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("client_id", googleClientId);
                body.add("client_secret", googleClientSecret);
                body.add("refresh_token", user.getGoogleRefreshToken());
                body.add("grant_type", "refresh_token");

                ResponseEntity<String> resp = restTemplate.exchange(
                        "https://oauth2.googleapis.com/token",
                        HttpMethod.POST,
                        new HttpEntity<>(body, headers),
                        String.class);

                JsonNode json = objectMapper.readTree(resp.getBody());
                String newToken = json.path("access_token").asText(null);
                if (newToken != null) {
                    user.setGoogleAccessToken(newToken);
                    userRepository.save(user);
                    log.debug("Refreshed Google access token for user {}", user.getEmail());
                    return newToken;
                }
            } catch (Exception e) {
                log.warn("Failed to refresh Google access token for user {}: {}", user.getEmail(), e.getMessage());
            }
        }
        return user.getGoogleAccessToken();
    }

    // ─── PRODUCTION: real Google Business Profile API ──────────────────────────

    private List<Business> connectRealGmb(User user) {
        String token = user.getGoogleAccessToken();
        List<Business> result = new ArrayList<>();

        try {
            HttpHeaders headers = bearerHeaders(token);
            ResponseEntity<String> accountsResp = restTemplate.exchange(
                    GMB_ACCOUNTS_URL, HttpMethod.GET,
                    new HttpEntity<>(headers), String.class);

            JsonNode accounts = objectMapper.readTree(accountsResp.getBody()).path("accounts");
            if (!accounts.isArray() || accounts.isEmpty()) {
                throw new RuntimeException("No Google Business Profile accounts found for user: " +
                        user.getEmail() + ". Ensure the Google account has a verified Business Profile.");
            }

            for (JsonNode account : accounts) {
                String accountName = account.path("name").asText();
                String accountDisplayName = account.path("accountName").asText("My Business");

                Business business = Business.builder()
                        .userId(user.getId())
                        .name(accountDisplayName)
                        .googleAccountId(accountName)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                business = businessRepository.save(business);

                String locUrl = String.format(GMB_LOCATIONS_URL, accountName);
                ResponseEntity<String> locsResp = restTemplate.exchange(
                        locUrl, HttpMethod.GET,
                        new HttpEntity<>(headers), String.class);

                JsonNode locations = objectMapper.readTree(locsResp.getBody()).path("locations");
                if (locations.isArray()) {
                    for (JsonNode loc : locations) {
                        Location location = mapRealLocation(loc, business);
                        location = locationRepository.save(location);
                        syncRealReviews(location, business, token);
                    }
                }
                result.add(business);
            }

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            log.error("GMB API quota exceeded for user {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("GMB_API_QUOTA_EXCEEDED: The Google Business Profile API quota is 0 for this project. " +
                    "Please request API access at https://developers.google.com/my-business/content/prereqs", e);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("429") || msg.contains("RATE_LIMIT_EXCEEDED") || msg.contains("RESOURCE_EXHAUSTED") || msg.contains("quota")) {
                log.error("GMB API quota exceeded for user {}: {}", user.getEmail(), msg);
                throw new RuntimeException("GMB_API_QUOTA_EXCEEDED: The Google Business Profile API quota is 0 for this project. " +
                        "Please request API access at https://developers.google.com/my-business/content/prereqs", e);
            }
            log.error("Failed to connect real GMB for user {}: {}", user.getEmail(), msg);
            throw new RuntimeException("Google Business Profile API error: " + msg, e);
        }

        return result;
    }

    private Location mapRealLocation(JsonNode loc, Business business) {
        String googleLocationId = loc.path("name").asText();
        String title = loc.path("title").asText("My Location");

        JsonNode addr = loc.path("storefrontAddress");
        String address = buildAddress(addr);

        JsonNode phone = loc.path("phoneNumbers").path("primaryPhone");
        String website = loc.path("websiteUri").asText(null);
        String category = loc.path("categories").path("primaryCategory")
                .path("displayName").asText("Local Business");

        return Location.builder()
                .businessId(business.getId())
                .googleLocationId(googleLocationId)
                .name(title)
                .address(address)
                .phone(phone.asText(null))
                .website(website)
                .category(category)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private void syncRealReviews(Location location, Business business, String token) {
        try {
            String nextPageToken = null;
            int totalSynced = 0;

            String accountId = business.getGoogleAccountId();
            String locationId = location.getGoogleLocationId();
            String fullLocationName = accountId + "/" + locationId;

            do {
                String url = String.format(GMB_REVIEWS_BASE_URL, fullLocationName);
                if (nextPageToken != null) {
                    url += "&pageToken=" + nextPageToken;
                }

                HttpHeaders headers = bearerHeaders(token);
                ResponseEntity<String> resp = restTemplate.exchange(
                        url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

                JsonNode root = objectMapper.readTree(resp.getBody());
                JsonNode reviews = root.path("reviews");
                if (!reviews.isArray()) break;

                for (JsonNode r : reviews) {
                    String googleReviewId = r.path("reviewId").asText();
                    if (reviewRepository.findByGoogleReviewId(googleReviewId).isPresent()) continue;

                    String ratingStr = r.path("starRating").asText("FIVE");
                    int rating = parseStarRating(ratingStr);
                    String comment = r.path("comment").asText(null);
                    String reviewerName = r.path("reviewer").path("displayName").asText("Anonymous");
                    String reviewerPhoto = r.path("reviewer").path("profilePhotoUrl").asText(null);

                    Review review = Review.builder()
                            .locationId(location.getId())
                            .googleReviewId(googleReviewId)
                            .reviewerName(reviewerName)
                            .reviewerProfilePhoto(reviewerPhoto)
                            .rating(rating)
                            .comment(comment)
                            .status("UNANSWERED")
                            .googleCreatedTime(LocalDateTime.now())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    review = reviewRepository.save(review);

                    notificationService.sendNewReviewAlert(review, location);
                    totalSynced++;
                }

                nextPageToken = root.path("nextPageToken").asText(null);
                if (nextPageToken != null && nextPageToken.isBlank()) nextPageToken = null;

            } while (nextPageToken != null);

            log.info("Synced {} real reviews for location: {}", totalSynced, location.getName());

        } catch (Exception e) {
            log.error("Failed to sync reviews for location {}: {}", location.getName(), e.getMessage());
        }
    }

    public void disconnectGmb(User userParam) {
        log.info("Disconnecting GMB data for user {}", userParam.getEmail());
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userParam.getId()));

        deleteAssociatedGmbData(user.getId());

        user.setGoogleAccessToken(null);
        user.setGoogleRefreshToken(null);
        userRepository.save(user);
    }

    public void deleteUserAccount(User userParam) {
        log.info("DPDP Erasure Request: permanently deleting user account and all personal data: {}", userParam.getEmail());
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userParam.getId()));

        // 1. Delete associated business and locations data
        deleteAssociatedGmbData(user.getId());

        // 2. Delete subscription
        subscriptionRepository.findByUserId(user.getId()).ifPresent(subscriptionRepository::delete);

        // 3. Delete user document
        userRepository.delete(user);
        log.info("Successfully deleted user and all personal data: {}", user.getEmail());
    }

    private void deleteAssociatedGmbData(String userId) {
        List<Business> businesses = businessRepository.findByUserId(userId);
        for (Business business : businesses) {
            List<Location> locations = locationRepository.findByBusinessId(business.getId());
            for (Location location : locations) {
                // Delete reviews and replies
                List<Review> reviews = reviewRepository.findByLocationId(location.getId());
                for (Review review : reviews) {
                    reviewReplyRepository.findByReviewId(review.getId()).ifPresent(reviewReplyRepository::delete);
                    reviewRepository.delete(review);
                }

                // Delete posts
                List<Post> posts = postRepository.findByLocationId(location.getId());
                postRepository.deleteAll(posts);

                // Delete audits
                List<SEOAudit> audits = seoAuditRepository.findByLocationIdOrderByCreatedAtDesc(location.getId());
                seoAuditRepository.deleteAll(audits);

                // Delete reports
                List<AIReport> reports = aiReportRepository.findByLocationIdOrderByCreatedAtDesc(location.getId());
                aiReportRepository.deleteAll(reports);

                // Delete competitors
                List<Competitor> competitors = competitorRepository.findByLocationId(location.getId());
                competitorRepository.deleteAll(competitors);

                locationRepository.delete(location);
            }
            businessRepository.delete(business);
        }
    }

    public void publishReviewReply(String reviewId, String replyText) {
        log.info("Publishing review reply for reviewId: {} in {} mode", reviewId, apiMode);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));
                
        if ("SANDBOX".equalsIgnoreCase(apiMode)) {
            log.info("SANDBOX mode: simulated successful publishing of reply: {}", replyText);
            return;
        }

        Location location = locationRepository.findById(review.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Location not found for review: " + reviewId));
                
        Business business = businessRepository.findById(location.getBusinessId())
                .orElseThrow(() -> new IllegalArgumentException("Business not found for location: " + location.getId()));
                
        User user = userRepository.findById(business.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found for business: " + business.getId()));

        String token = ensureFreshToken(user);
        if (token == null) {
            throw new RuntimeException("Cannot publish reply because Google access token is missing.");
        }

        try {
            String fullLocationName = location.getGoogleLocationId();
            if (!fullLocationName.startsWith("accounts/")) {
                fullLocationName = business.getGoogleAccountId() + "/" + fullLocationName;
            }
            
            String url = String.format("https://mybusiness.googleapis.com/v4/%s/reviews/%s/reply",
                    fullLocationName, review.getGoogleReviewId());
                    
            HttpHeaders headers = bearerHeaders(token);
            Map<String, String> body = new HashMap<>();
            body.put("comment", replyText);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            
            log.info("Sending PUT request to Google API: {}", url);
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
            log.info("Successfully published reply to Google GMB API for reviewId: {}", reviewId);
            
        } catch (org.springframework.web.client.HttpClientErrorException.Forbidden e) {
            log.error("Google API forbidden error publishing reply for reviewId: {}", reviewId, e);
            throw new RuntimeException("GMB API error: Access Forbidden. Ensure your Google account has manage permissions on this profile.", e);
        } catch (Exception e) {
            log.error("Failed to publish reply to Google GMB API for reviewId: {}", reviewId, e);
            throw new RuntimeException("Google Business Profile API error: " + e.getMessage(), e);
        }
    }

    public void publishGmbPost(String postId) {
        log.info("Publishing GMB local post for postId: {} in {} mode", postId, apiMode);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));

        if ("SANDBOX".equalsIgnoreCase(apiMode)) {
            log.info("SANDBOX mode: simulated successful publishing of post to Google: {}", post.getTopic());
            return;
        }

        Location location = locationRepository.findById(post.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Location not found for post: " + postId));

        Business business = businessRepository.findById(location.getBusinessId())
                .orElseThrow(() -> new IllegalArgumentException("Business not found for location: " + location.getId()));

        User user = userRepository.findById(business.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found for business: " + business.getId()));

        String token = ensureFreshToken(user);
        if (token == null) {
            throw new RuntimeException("Cannot publish post because Google access token is missing.");
        }

        try {
            // Validate post content - Google API limit is 300 chars
            String content = post.getContent();
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Post content cannot be empty.");
            }
            if (content.length() > 300) {
                throw new RuntimeException("Post content exceeds Google API limit of 300 characters. Current: " + content.length() + " chars. Please shorten your post.");
            }

            // Build full location resource name in correct format
            String accountId = business.getGoogleAccountId();
            String locationId = location.getGoogleLocationId();

            // Remove "accounts/" prefix if present in location ID
            if (locationId.startsWith("accounts/")) {
                locationId = locationId.substring("accounts/".length());
            }
            // Remove account ID from location if it's duplicated
            if (locationId.startsWith(accountId + "/")) {
                locationId = locationId.substring((accountId + "/").length());
            }

            String fullLocationName = String.format("accounts/%s/locations/%s", accountId, locationId);
            String url = String.format("https://mybusiness.googleapis.com/v4/%s/localPosts", fullLocationName);

            HttpHeaders headers = bearerHeaders(token);

            Map<String, Object> body = new HashMap<>();
            body.put("summary", content.trim()); // Post content (required, max 300 chars)

            // Media/Image - only include if valid URL
            if (post.getMediaUrl() != null && !post.getMediaUrl().isEmpty() && !post.getMediaUrl().startsWith("data:")) {
                try {
                    Map<String, Object> mediaObj = new HashMap<>();
                    mediaObj.put("mediaFormat", "PHOTO");
                    mediaObj.put("sourceUrl", post.getMediaUrl());
                    body.put("media", List.of(mediaObj));
                    log.info("Including media in post: {}", post.getMediaUrl());
                } catch (Exception mediaEx) {
                    log.warn("Could not add media to post: {}", mediaEx.getMessage());
                    // Continue without media
                }
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            log.info("Sending POST request to GMB localPosts API for location: {}", fullLocationName);
            log.debug("Post payload: {}", body);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            log.info("Successfully published local post to Google GMB API for postId: {}", postId);

        } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
            String errorBody = e.getResponseBodyAsString();
            log.error("Bad request (400) publishing post. Response body: {}", errorBody);
            log.error("Request was sent to: {}", String.format("https://mybusiness.googleapis.com/v4/%s/localPosts", post.getLocationId()));
            throw new RuntimeException("Google API rejected post: " + errorBody, e);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            log.error("HTTP {} error publishing post. Response: {}", e.getStatusCode(), errorBody);
            throw new RuntimeException("Google API error (" + e.getStatusCode() + "): " + errorBody, e);
        } catch (Exception e) {
            log.error("Failed to publish local post to Google GMB API for postId: {}", postId, e);
            throw new RuntimeException("Google Business Profile API error: " + e.getMessage(), e);
        }
    }

    public Location updateLocationProfile(
            String locationId, String name, String category, String phone, String website, String address, String description
    ) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));
                
        location.setName(name);
        location.setCategory(category);
        location.setPhone(phone);
        location.setWebsite(website);
        location.setAddress(address);
        if (description != null) location.setDescription(description);
        location.setUpdatedAt(LocalDateTime.now());
        Location saved = locationRepository.save(location);

        if ("SANDBOX".equalsIgnoreCase(apiMode)) {
            log.info("SANDBOX mode: simulated successful update of GMB profile details.");
            return saved;
        }

        Business business = businessRepository.findById(location.getBusinessId()).orElse(null);
        if (business == null) return saved;
        
        User user = userRepository.findById(business.getUserId()).orElse(null);
        if (user == null) return saved;

        String token = ensureFreshToken(user);
        if (token != null) {
            try {
                List<String> masks = new ArrayList<>(List.of("title", "websiteUri", "phoneNumbers"));
                if (description != null && !description.isEmpty()) masks.add("profile.description");

                String url = String.format("https://mybusinessbusinessinformation.googleapis.com/v1/%s" +
                        "?updateMask=%s", location.getGoogleLocationId(), String.join(",", masks));
                        
                HttpHeaders headers = bearerHeaders(token);
                
                Map<String, Object> body = new HashMap<>();
                body.put("title", name);
                body.put("websiteUri", website);
                
                if (phone != null && !phone.isEmpty()) {
                    body.put("phoneNumbers", Map.of("primaryPhone", phone));
                }

                if (description != null && !description.isEmpty()) {
                    body.put("profile", Map.of("description", description));
                }
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                log.info("Sending PUT request to Google Business Info API: {}", url);
                restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
                log.info("Successfully updated GMB profile on Google Business Info API for locationId: {}", locationId);
                
            } catch (Exception e) {
                log.error("Failed to update GMB profile on Google API for locationId: {}", locationId, e);
            }
        }
        return saved;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private HttpHeaders bearerHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String buildAddress(JsonNode addr) {
        if (addr.isMissingNode()) return null;
        List<String> parts = new ArrayList<>();
        addr.path("addressLines").forEach(l -> parts.add(l.asText()));
        String locality = addr.path("locality").asText("");
        String region = addr.path("administrativeArea").asText("");
        String postal = addr.path("postalCode").asText("");
        if (!locality.isEmpty()) parts.add(locality);
        if (!region.isEmpty()) parts.add(region);
        if (!postal.isEmpty()) parts.add(postal);
        return String.join(", ", parts);
    }

    private int parseStarRating(String rating) {
        return switch (rating) {
            case "ONE" -> 1;
            case "TWO" -> 2;
            case "THREE" -> 3;
            case "FOUR" -> 4;
            default -> 5;
        };
    }
}
