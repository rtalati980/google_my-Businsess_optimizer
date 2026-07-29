package com.gmb.manager.service;

import com.gmb.manager.entity.LocationMetrics;
import com.gmb.manager.repository.LocationMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final LocationMetricsRepository metricsRepository;

    // Simulate fetching from Google Business Profile API
    // TODO: Replace with actual Google API calls
    public LocationMetrics fetchMetricsFromGoogle(String locationId, LocalDate date) {
        try {
            // This would call Google Business Profile API
            // For now, generate realistic mock data
            LocationMetrics metrics = generateMockMetrics(locationId, date);
            return metricsRepository.save(metrics);
        } catch (Exception e) {
            log.error("Failed to fetch metrics for location {}: {}", locationId, e.getMessage());
            return null;
        }
    }

    @Scheduled(cron = "0 0 1 * * *") // Daily at 1 AM
    public void dailyMetricsCollection() {
        log.info("Starting daily metrics collection");
        // This would fetch all locations and collect metrics
        // In production, iterate through all active locations
    }

    public LocationMetrics getMetricsForToday(String locationId) {
        return metricsRepository.findByLocationIdAndDate(locationId, LocalDate.now())
                .orElse(null);
    }

    public LocationMetrics getMetricsForDate(String locationId, LocalDate date) {
        return metricsRepository.findByLocationIdAndDate(locationId, date)
                .orElse(null);
    }

    public List<LocationMetrics> getMetricsForDateRange(String locationId, LocalDate startDate, LocalDate endDate) {
        return metricsRepository.findMetricsInDateRange(locationId, startDate, endDate);
    }

    public List<LocationMetrics> getLastNDays(String locationId, int days) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days);
        return metricsRepository.findMetricsInDateRange(locationId, startDate, today);
    }

    public Map<String, Object> getMetricsSummary(String locationId, int days) {
        List<LocationMetrics> metrics = getLastNDays(locationId, days);

        if (metrics.isEmpty()) {
            return Map.of("message", "No metrics available");
        }

        LocationMetrics latest = metrics.get(0);
        LocationMetrics previous = metrics.size() > 1 ? metrics.get(1) : null;

        return Map.of(
                "today", latest,
                "searchViews", latest.getSearchViews(),
                "directionRequests", latest.getDirectionRequests(),
                "phoneClicks", latest.getPhoneClicks(),
                "websiteClicks", latest.getWebsiteClicks(),
                "totalInteractions",
                    (latest.getSearchViews() != null ? latest.getSearchViews() : 0) +
                    (latest.getDirectionRequests() != null ? latest.getDirectionRequests() : 0) +
                    (latest.getPhoneClicks() != null ? latest.getPhoneClicks() : 0) +
                    (latest.getWebsiteClicks() != null ? latest.getWebsiteClicks() : 0),
                "previousDay", previous,
                "trend", calculateTrend(latest, previous)
        );
    }

    public Map<String, Object> getDailyTrend(String locationId, LocalDate startDate, LocalDate endDate) {
        List<LocationMetrics> metrics = metricsRepository.findMetricsInDateRange(locationId, startDate, endDate);

        // Group by metric type and create trend arrays
        List<Map<String, Object>> dailyData = new ArrayList<>();

        for (LocationMetrics m : metrics) {
            dailyData.add(Map.of(
                    "date", m.getDate(),
                    "searchViews", m.getSearchViews() != null ? m.getSearchViews() : 0,
                    "directionRequests", m.getDirectionRequests() != null ? m.getDirectionRequests() : 0,
                    "phoneClicks", m.getPhoneClicks() != null ? m.getPhoneClicks() : 0,
                    "websiteClicks", m.getWebsiteClicks() != null ? m.getWebsiteClicks() : 0,
                    "totalInteractions",
                        (m.getSearchViews() != null ? m.getSearchViews() : 0) +
                        (m.getDirectionRequests() != null ? m.getDirectionRequests() : 0) +
                        (m.getPhoneClicks() != null ? m.getPhoneClicks() : 0) +
                        (m.getWebsiteClicks() != null ? m.getWebsiteClicks() : 0)
            ));
        }

        return Map.of(
                "period", Map.of("startDate", startDate, "endDate", endDate),
                "data", dailyData,
                "summary", calculatePeriodSummary(metrics)
        );
    }

    public Map<String, Object> getComparison(String locationId, LocalDate startDate, LocalDate endDate) {
        LocalDate periodStart = startDate;
        LocalDate periodEnd = endDate;
        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(periodStart, periodEnd);

        LocalDate prevPeriodEnd = periodStart.minusDays(1);
        LocalDate prevPeriodStart = prevPeriodEnd.minusDays(daysDiff);

        List<LocationMetrics> currentPeriod = metricsRepository.findMetricsInDateRange(locationId, periodStart, periodEnd);
        List<LocationMetrics> previousPeriod = metricsRepository.findMetricsInDateRange(locationId, prevPeriodStart, prevPeriodEnd);

        return Map.of(
                "currentPeriod", Map.of("startDate", periodStart, "endDate", periodEnd, "metrics", currentPeriod),
                "previousPeriod", Map.of("startDate", prevPeriodStart, "endDate", prevPeriodEnd, "metrics", previousPeriod),
                "comparison", compareMetrics(currentPeriod, previousPeriod)
        );
    }

    public Map<String, Object> getTopPerformingDays(String locationId, int days, int limit) {
        List<LocationMetrics> metrics = getLastNDays(locationId, days);

        List<LocationMetrics> sorted = metrics.stream()
                .sorted((a, b) -> {
                    int aTotal = (a.getSearchViews() != null ? a.getSearchViews() : 0) +
                                (a.getPhoneClicks() != null ? a.getPhoneClicks() : 0);
                    int bTotal = (b.getSearchViews() != null ? b.getSearchViews() : 0) +
                                (b.getPhoneClicks() != null ? b.getPhoneClicks() : 0);
                    return Integer.compare(bTotal, aTotal);
                })
                .limit(limit)
                .toList();

        return Map.of(
                "topDays", sorted,
                "count", sorted.size()
        );
    }

    private LocationMetrics generateMockMetrics(String locationId, LocalDate date) {
        // Generate realistic daily metrics
        Random rand = new Random();
        int baseSearchViews = 45 + rand.nextInt(100);
        int basePhoneClicks = 15 + rand.nextInt(40);

        return LocationMetrics.builder()
                .locationId(locationId)
                .date(date)
                .searchViews(baseSearchViews)
                .directionRequests(10 + rand.nextInt(20))
                .phoneClicks(basePhoneClicks)
                .websiteClicks(5 + rand.nextInt(15))
                .postViews(30 + rand.nextInt(80))
                .postEngagements(3 + rand.nextInt(10))
                .totalQuestions(rand.nextInt(5))
                .unansweredQuestions(rand.nextInt(3))
                .photoViews(20 + rand.nextInt(60))
                .photoClicks(5 + rand.nextInt(15))
                .costPerClick(0.5 + (rand.nextDouble() * 1.5))
                .conversionRate(2.5 + (rand.nextDouble() * 5.0))
                .fetchedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private Map<String, Object> calculateTrend(LocationMetrics current, LocationMetrics previous) {
        if (previous == null) {
            return Map.of("type", "N/A");
        }

        int currentTotal = (current.getSearchViews() != null ? current.getSearchViews() : 0) +
                          (current.getPhoneClicks() != null ? current.getPhoneClicks() : 0);
        int previousTotal = (previous.getSearchViews() != null ? previous.getSearchViews() : 0) +
                           (previous.getPhoneClicks() != null ? previous.getPhoneClicks() : 0);

        int change = currentTotal - previousTotal;
        double percentChange = previousTotal > 0 ? (change * 100.0 / previousTotal) : 0;

        return Map.of(
                "change", change,
                "percentChange", String.format("%.1f%%", percentChange),
                "direction", change >= 0 ? "UP" : "DOWN"
        );
    }

    private Map<String, Object> calculatePeriodSummary(List<LocationMetrics> metrics) {
        if (metrics.isEmpty()) {
            return Map.of("message", "No data");
        }

        int totalSearchViews = metrics.stream().mapToInt(m -> m.getSearchViews() != null ? m.getSearchViews() : 0).sum();
        int totalPhoneClicks = metrics.stream().mapToInt(m -> m.getPhoneClicks() != null ? m.getPhoneClicks() : 0).sum();
        int totalDirections = metrics.stream().mapToInt(m -> m.getDirectionRequests() != null ? m.getDirectionRequests() : 0).sum();
        int totalWebsiteClicks = metrics.stream().mapToInt(m -> m.getWebsiteClicks() != null ? m.getWebsiteClicks() : 0).sum();

        int totalInteractions = totalSearchViews + totalPhoneClicks + totalDirections + totalWebsiteClicks;
        double avgDaily = totalInteractions / (double) metrics.size();

        return Map.of(
                "totalInteractions", totalInteractions,
                "totalSearchViews", totalSearchViews,
                "totalPhoneClicks", totalPhoneClicks,
                "totalDirections", totalDirections,
                "totalWebsiteClicks", totalWebsiteClicks,
                "averageDailyInteractions", String.format("%.1f", avgDaily),
                "days", metrics.size()
        );
    }

    private Map<String, Object> compareMetrics(List<LocationMetrics> current, List<LocationMetrics> previous) {
        int currentTotal = calculateTotalInteractions(current);
        int previousTotal = calculateTotalInteractions(previous);

        int change = currentTotal - previousTotal;
        double percentChange = previousTotal > 0 ? (change * 100.0 / previousTotal) : 0;

        return Map.of(
                "currentTotal", currentTotal,
                "previousTotal", previousTotal,
                "change", change,
                "percentChange", String.format("%.1f%%", percentChange),
                "direction", change >= 0 ? "📈 UP" : "📉 DOWN"
        );
    }

    private int calculateTotalInteractions(List<LocationMetrics> metrics) {
        return metrics.stream()
                .mapToInt(m ->
                    (m.getSearchViews() != null ? m.getSearchViews() : 0) +
                    (m.getPhoneClicks() != null ? m.getPhoneClicks() : 0) +
                    (m.getDirectionRequests() != null ? m.getDirectionRequests() : 0) +
                    (m.getWebsiteClicks() != null ? m.getWebsiteClicks() : 0)
                )
                .sum();
    }
}
