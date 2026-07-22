package com.gmb.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Review;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsightService {

    private final ReviewRepository reviewRepository;
    private final LocationRepository locationRepository;
    private final GmbService gmbService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, CacheEntry> insightsCache = new ConcurrentHashMap<>();

    private static class CacheEntry {
        final Map<String, Object> data;
        final LocalDateTime expiry;

        CacheEntry(Map<String, Object> data, int ttlMinutes) {
            this.data = data;
            this.expiry = LocalDateTime.now().plusMinutes(ttlMinutes);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }
    }

    private static final String PERFORMANCE_API_URL =
            "https://businessprofileperformance.googleapis.com/v1/%s:fetchMultiDailyMetricsTimeSeries" +
            "?dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_SEARCH" +
            "&dailyMetrics=BUSINESS_IMPRESSIONS_MOBILE_SEARCH" +
            "&dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_MAPS" +
            "&dailyMetrics=BUSINESS_IMPRESSIONS_MOBILE_MAPS" +
            "&dailyMetrics=CALL_CLICKS" +
            "&dailyMetrics=WEBSITE_CLICKS" +
            "&dailyMetrics=BUSINESS_DIRECTION_REQUESTS" +
            "&dailyRange.startDate.year=%d&dailyRange.startDate.month=%d&dailyRange.startDate.day=%d" +
            "&dailyRange.endDate.year=%d&dailyRange.endDate.month=%d&dailyRange.endDate.day=%d";

    public Map<String, Object> getLocationInsights(String locationId, User user) {
        return getLocationInsights(locationId, user, false);
    }

    public Map<String, Object> getLocationInsights(String locationId, User user, boolean refresh) {
        String cacheKey = locationId + "_" + (user != null ? user.getId() : "null");
        if (!refresh) {
            CacheEntry entry = insightsCache.get(cacheKey);
            if (entry != null && !entry.isExpired()) {
                log.debug("Returning cached GMB insights for location {}", locationId);
                return entry.data;
            }
        }

        List<Review> reviews = reviewRepository.findByLocationId(locationId);

        double avgRating;
        int reviewCount = reviews.size();
        if (reviewCount > 0) {
            double sum = reviews.stream().mapToInt(Review::getRating).sum();
            avgRating = Math.round((sum / reviewCount) * 10.0) / 10.0;
        } else {
            avgRating = 0.0;
        }

        Map<String, Object> insights = new HashMap<>();
        insights.put("locationId", locationId);
        insights.put("averageRating", avgRating);
        insights.put("reviewCount", reviewCount);

        boolean realDataLoaded = false;
        if (user != null) {
            String token = gmbService.ensureFreshToken(user);
            if (token != null) {
                realDataLoaded = fetchRealPerformanceData(locationId, token, insights);
            }
        }

        if (!realDataLoaded) {
            log.warn("Using review-derived stats for location {} (no GMB Performance API data)", locationId);
            insights.put("calls", null);
            insights.put("websiteClicks", null);
            insights.put("directionRequests", null);
            insights.put("searchViews", null);
            insights.put("mapsViews", null);
        }

        insights.put("reviewGrowth", buildReviewGrowth(reviews));
        insights.put("dailyInteractions", buildDailyInteractions(insights));

        insightsCache.put(cacheKey, new CacheEntry(insights, 60));

        return insights;
    }

    private boolean fetchRealPerformanceData(String locationId, String token, Map<String, Object> insights) {
        try {
            Location location = locationRepository.findById(locationId).orElse(null);
            if (location == null || location.getGoogleLocationId() == null) return false;

            LocalDateTime end = LocalDateTime.now();
            LocalDateTime start = end.minusDays(29);

            // Google stores the full resource name as "accounts/XXXXX/locations/YYYYY".
            // The Business Profile Performance API requires only the "locations/YYYYY" portion.
            String rawGoogleId = location.getGoogleLocationId();
            String googleLocationId;
            if (rawGoogleId.contains("/locations/")) {
                // Extract everything from "locations/" onward
                googleLocationId = "locations/" + rawGoogleId.split("/locations/")[1];
            } else if (rawGoogleId.startsWith("locations/")) {
                // Already in the correct short form
                googleLocationId = rawGoogleId;
            } else {
                // Bare numeric ID — wrap it
                googleLocationId = "locations/" + rawGoogleId;
            }

            String url = String.format(PERFORMANCE_API_URL,
                    googleLocationId,
                    start.getYear(), start.getMonthValue(), start.getDayOfMonth(),
                    end.getYear(), end.getMonthValue(), end.getDayOfMonth());

            log.debug("Fetching GMB Performance data from URL: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<String> resp = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            String rawBody = resp.getBody();
            log.info("GMB Performance API raw response for location {}: {}", locationId, rawBody);

            JsonNode root = objectMapper.readTree(rawBody);
            JsonNode seriesList = root.path("multiDailyMetricTimeSeries");

            long callClicks = 0, websiteClicks = 0, directionRequests = 0;
            long searchImpressions = 0, mapsImpressions = 0;

            // The API returns each group with:
            //   "dailyMetrics": [ "METRIC_A", "METRIC_B", ... ]   (array, plural)
            //   "timeSeries":   [ { "datedValues": [...] }, ... ]  (array, parallel-indexed)
            // We iterate by index so each metric maps to its own timeSeries.
            for (JsonNode seriesGroup : seriesList) {
                JsonNode metricsArr   = seriesGroup.path("dailyMetrics");   // always an array
                JsonNode tsArr        = seriesGroup.path("timeSeries");      // always an array

                for (int i = 0; i < metricsArr.size(); i++) {
                    String metric = metricsArr.get(i).asText();
                    JsonNode ts   = (i < tsArr.size()) ? tsArr.get(i) : null;
                    if (ts == null) continue;

                    for (JsonNode entry : ts.path("datedValues")) {
                        // Google omits the "value" field for days with zero activity;
                        // asLong(0) safely defaults those to 0.
                        long val = entry.path("value").asLong(0);
                        switch (metric) {
                            case "CALL_CLICKS"                       -> callClicks       += val;
                            case "WEBSITE_CLICKS"                    -> websiteClicks    += val;
                            case "BUSINESS_DIRECTION_REQUESTS"       -> directionRequests+= val;
                            case "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
                                 "BUSINESS_IMPRESSIONS_MOBILE_SEARCH"  -> searchImpressions += val;
                            case "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
                                 "BUSINESS_IMPRESSIONS_MOBILE_MAPS"    -> mapsImpressions   += val;
                        }
                    }
                }
            }

            insights.put("calls", callClicks);
            insights.put("websiteClicks", websiteClicks);
            insights.put("directionRequests", directionRequests);
            insights.put("searchViews", searchImpressions);
            insights.put("mapsViews", mapsImpressions);

            log.info("Loaded real GMB Performance data for location {} (googleLocationId={}): " +
                            "searchViews={}, mapsViews={}, calls={}, websiteClicks={}, directions={}",
                    locationId, googleLocationId,
                    searchImpressions, mapsImpressions, callClicks, websiteClicks, directionRequests);
            return true;

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("GMB Performance API HTTP error for location {}: status={} body={}",
                    locationId, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Failed to fetch GMB Performance data for location {}: {}", locationId, e.getMessage());
            return false;
        }
    }

    private List<Map<String, Object>> buildReviewGrowth(List<Review> reviews) {
        Map<String, Long> byMonth = reviews.stream()
                .filter(r -> r.getGoogleCreatedTime() != null)
                .sorted(Comparator.comparing(Review::getGoogleCreatedTime))
                .collect(Collectors.groupingBy(
                        r -> r.getGoogleCreatedTime().format(DateTimeFormatter.ofPattern("MMM")),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        List<Map<String, Object>> growth = new ArrayList<>();
        long cumulative = 0;
        for (Map.Entry<String, Long> entry : byMonth.entrySet()) {
            cumulative += entry.getValue();
            Map<String, Object> point = new HashMap<>();
            point.put("month", entry.getKey());
            point.put("reviewsCount", cumulative);
            growth.add(point);
        }
        return growth;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildDailyInteractions(Map<String, Object> insights) {
        Object callsObj = insights.get("calls");
        if (callsObj == null) return Collections.emptyList();

        long totalCalls = ((Number) callsObj).longValue();
        long totalClicks = ((Number) insights.get("websiteClicks")).longValue();
        long totalDirections = ((Number) insights.get("directionRequests")).longValue();

        double[] weights = {0.10, 0.14, 0.12, 0.15, 0.20, 0.18, 0.11};
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};

        List<Map<String, Object>> interactions = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("day", days[i]);
            point.put("calls", Math.round(totalCalls * weights[i]));
            point.put("views", Math.round(totalClicks * weights[i]));
            point.put("directions", Math.round(totalDirections * weights[i]));
            interactions.add(point);
        }
        return interactions;
    }
}
