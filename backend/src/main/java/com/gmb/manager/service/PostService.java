package com.gmb.manager.service;

import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Post;
import com.gmb.manager.entity.PostSeoMetrics;
import com.gmb.manager.entity.Review;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.PostRepository;
import com.gmb.manager.repository.PostSeoMetricsRepository;
import com.gmb.manager.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final LocationRepository locationRepository;
    private final PostSeoMetricsRepository postSeoMetricsRepository;
    private final ReviewRepository reviewRepository;
    private final AiService aiService;
    private final GmbService gmbService;
    private final SeoOptimizationService seoOptimizationService;

    public List<Post> getPostsByLocation(String locationId) {
        return postRepository.findByLocationId(locationId);
    }

    public Post generatePost(String locationId, String postType, String topic) {
        return generatePost(locationId, postType, topic, false);
    }

    public Post generatePost(String locationId, String postType, String topic, boolean includeImage) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));

        // Get customer reviews to understand what customers love about this business
        List<Review> reviews = reviewRepository.findByLocationId(locationId);
        String reviewSummary = extractPositiveReviewThemes(reviews);

        String systemInstruction = String.format(
                "You are GMB AI Manager, an expert social media copywriter specializing in local business marketing for '%s', which is a '%s' business. " +
                "Write a highly engaging, short Google Business Profile post (maximum 300 words) that is SPECIFIC to this exact business. " +
                "Reference what customers love about this business (based on their reviews). " +
                "The content must be UNIQUE to '%s' - not generic. " +
                "Customize to the business's region (India/USA/Europe) with appropriate spellings and local expressions. " +
                "Include a strong call to action and relevant emojis.\n" +
                "Customer feedback themes: %s",
                location.getName(), location.getCategory(), location.getName(), reviewSummary
        );

        String prompt = String.format(
                "Generate a Google Business Profile post for THIS SPECIFIC BUSINESS:\n\n" +
                "Business Name: %s\n" +
                "Category: %s\n" +
                "Address: %s\n" +
                "Post Type: %s\n" +
                "Post Topic/Instructions: %s\n\n" +
                "Requirements:\n" +
                "1. Make it SPECIFIC to %s - include actual details about this business\n" +
                "2. Reference what customers love (positive review themes)\n" +
                "3. Use business-specific language and offerings\n" +
                "4. Strong call-to-action encouraging visits/bookings\n" +
                "5. Maximum 300 characters\n\n" +
                "Generate ONLY the final post text with no titles or surrounding quotes.",
                location.getName(),
                location.getCategory(),
                location.getAddress(),
                postType,
                topic != null && !topic.trim().isEmpty() ? topic : "Share what makes this business special",
                location.getName()
        );

        String generatedContent = aiService.generateContent(systemInstruction, prompt);

        String mediaUrl = null;
        if (includeImage) {
            mediaUrl = suggestBusinessSpecificImage(location.getCategory(), location.getName());
        }

        Post post = Post.builder()
                .locationId(locationId)
                .topic(topic != null && !topic.trim().isEmpty() ? topic : "Weekly Update")
                .content(generatedContent)
                .mediaUrl(mediaUrl)
                .postType(postType.toUpperCase())
                .status("DRAFT")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return postRepository.save(post);
    }

    private String extractPositiveReviewThemes(List<Review> reviews) {
        if (reviews.isEmpty()) return "Great customer service, quality work, friendly staff";

        // Extract positive themes from high-rated reviews
        StringBuilder themes = new StringBuilder();
        reviews.stream()
                .filter(r -> r.getRating() >= 4)
                .limit(3)
                .forEach(r -> {
                    if (r.getComment() != null && !r.getComment().isEmpty()) {
                        themes.append(r.getComment().substring(0, Math.min(50, r.getComment().length()))).append("; ");
                    }
                });

        return themes.length() > 0 ? themes.toString() : "Excellent service, professional staff, highly recommended";
    }

    private String suggestBusinessSpecificImage(String category, String businessName) {
        if (category == null) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600";
        String catLower = category.toLowerCase();

        // Business-type-specific images from Unsplash
        if (catLower.contains("salon") || catLower.contains("hair") || catLower.contains("beauty") || catLower.contains("spa")) {
            return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"; // Salon/Beauty
        } else if (catLower.contains("restaurant") || catLower.contains("cafe") || catLower.contains("food") || catLower.contains("dine")) {
            return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"; // Restaurant
        } else if (catLower.contains("dental") || catLower.contains("dentist") || catLower.contains("clinic")) {
            return "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80"; // Dental/Medical
        } else if (catLower.contains("garage") || catLower.contains("auto") || catLower.contains("mechanic") || catLower.contains("repair")) {
            return "https://images.unsplash.com/photo-1487754180144-351b8e906e6f?w=600&q=80"; // Auto repair
        } else if (catLower.contains("hotel") || catLower.contains("resort") || catLower.contains("hospitality")) {
            return "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"; // Hotel
        } else if (catLower.contains("shop") || catLower.contains("store") || catLower.contains("retail")) {
            return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"; // Retail shop
        } else if (catLower.contains("gym") || catLower.contains("fitness")) {
            return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"; // Fitness
        } else if (catLower.contains("bakery") || catLower.contains("cake")) {
            return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80"; // Bakery
        }

        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"; // General business
    }

    public Post updatePost(String postId, String content) {
        return updatePost(postId, content, null);
    }

    public Post updatePost(String postId, String content, String mediaUrl) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));

        post.setContent(content);
        if (mediaUrl != null) {
            post.setMediaUrl(mediaUrl);
        }
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post publishPost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));

        // Call Google GMB API to publish post (simulated in sandbox, real POST call in production)
        gmbService.publishGmbPost(postId);

        post.setStatus("PUBLISHED");
        post.setPublishedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Map<String, Object> generateOptimizedPost(String locationId, String postType, String topic, boolean includeImage) {
        log.info("Generating SEO-optimized post for location {}", locationId);

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));

        // Generate initial post
        Post initialPost = generatePost(locationId, postType, topic, includeImage);

        // Extract keywords from reviews for SEO optimization
        List<Review> reviews = reviewRepository.findByLocationId(locationId);
        List<String> suggestedKeywords = seoOptimizationService.extractKeywordsFromReviews(reviews);

        // Optimize content for SEO
        String optimizedContent = seoOptimizationService.generateSeoOptimizedContent(
                initialPost.getContent(), location, suggestedKeywords
        );

        initialPost.setContent(optimizedContent);
        initialPost.setUpdatedAt(LocalDateTime.now());
        Post savedPost = postRepository.save(initialPost);

        // Calculate SEO metrics
        PostSeoMetrics metrics = seoOptimizationService.calculateSeoMetrics(savedPost, optimizedContent, location);
        PostSeoMetrics savedMetrics = postSeoMetricsRepository.save(metrics);

        Map<String, Object> result = new HashMap<>();
        result.put("post", savedPost);
        result.put("seoMetrics", savedMetrics);
        result.put("optimization", Map.of(
                "seoScore", savedMetrics.getSeoScore(),
                "targetKeywords", savedMetrics.getTargetKeywords(),
                "estimatedReach", savedMetrics.getEstimatedReach(),
                "keywordDensity", String.format("%.1f%%", savedMetrics.getKeywordDensity()),
                "readabilityScore", String.format("%.1f", savedMetrics.getReadabilityScore()),
                "callToActionPresent", savedMetrics.getCallToActionPresent(),
                "localityMentions", savedMetrics.getLocalityMentions(),
                "mobileOptimized", savedMetrics.getMobileOptimized()
        ));

        return result;
    }

    public PostSeoMetrics getSeoMetrics(String postId) {
        return postSeoMetricsRepository.findByPostId(postId)
                .orElseThrow(() -> new IllegalArgumentException("SEO metrics not found for post: " + postId));
    }

    public List<PostSeoMetrics> getHighScoringPosts(String locationId, Integer minScore) {
        return postSeoMetricsRepository.findByLocationIdAndSeoScoreGreaterThanEqualOrderBySeoScoreDesc(locationId, minScore);
    }
}
