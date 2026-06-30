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

@Service
@RequiredArgsConstructor
@Slf4j
public class InsightService {

    private final ReviewRepository reviewRepository;
    private final LocationRepository locationRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        if (user != null && user.getGoogleAccessToken() != null) {
            realDataLoaded = fetchRealPerformanceData(locationId, user.getGoogleAccessToken(), insights);
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

        return insights;
    }

    private boolean fetchRealPerformanceData(String locationId, String token, Map<String, Object> insights) {
        try {
            Location location = locationRepository.findById(locationId).orElse(null);
            if (location == null || location.getGoogleLocationId() == null) return false;

            LocalDateTime end = LocalDateTime.now();
            LocalDateTime start = end.minusDays(29);

            String googleLocationId = location.getGoogleLocationId();
            String url = String.format(PERFORMANCE_API_URL,
                    googleLocationId,
                    start.getYear(), start.getMonthValue(), start.getDayOfMonth(),
                    end.getYear(), end.getMonthValue(), end.getDayOfMonth());

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<String> resp = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            JsonNode root = objectMapper.readTree(resp.getBody());
            JsonNode seriesList = root.path("multiDailyMetricTimeSeries");

            long callClicks = 0, websiteClicks = 0, directionRequests = 0;
            long searchImpressions = 0, mapsImpressions = 0;

            for (JsonNode seriesNode : seriesList) {
                String metric = seriesNode.path("dailyMetric").asText();
                JsonNode values = seriesNode.path("timeSeries").path("datedValues");

                for (JsonNode entry : values) {
                    long val = entry.path("value").asLong(0);
                    switch (metric) {
                        case "CALL_CLICKS" -> callClicks += val;
                        case "WEBSITE_CLICKS" -> websiteClicks += val;
                        case "BUSINESS_DIRECTION_REQUESTS" -> directionRequests += val;
                        case "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
                             "BUSINESS_IMPRESSIONS_MOBILE_SEARCH" -> searchImpressions += val;
                        case "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
                             "BUSINESS_IMPRESSIONS_MOBILE_MAPS" -> mapsImpressions += val;
                    }
                }
            }

            insights.put("calls", callClicks);
            insights.put("websiteClicks", websiteClicks);
            insights.put("directionRequests", directionRequests);
            insights.put("searchViews", searchImpressions);
            insights.put("mapsViews", mapsImpressions);

            log.info("Loaded real GMB Performance data for location {}", locationId);
            return true;

        } catch (Exception e) {
            log.error("Failed to fetch real GMB Performance data for location {}: {}", locationId, e.getMessage());
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
