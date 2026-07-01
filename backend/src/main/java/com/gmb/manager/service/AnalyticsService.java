package com.gmb.manager.service;

import com.gmb.manager.entity.CustomerInteraction;
import com.gmb.manager.entity.CustomerProfile;
import com.gmb.manager.repository.CustomerInteractionRepository;
import com.gmb.manager.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final CustomerInteractionRepository interactionRepository;
    private final CustomerProfileRepository profileRepository;

    public Map<String, Object> getDashboardAnalytics(String locationId) {
        log.info("Generating dashboard analytics for location {}", locationId);

        List<CustomerProfile> allCustomers = profileRepository.findByLocationId(locationId);
        List<CustomerInteraction> allInteractions = interactionRepository.findByLocationId(locationId);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalCustomers", allCustomers.size());
        dashboard.put("activeCustomers", allCustomers.stream().filter(c -> "ACTIVE".equals(c.getStatus())).count());
        dashboard.put("averageLifetimeValue", calculateAverageLTV(allCustomers));
        dashboard.put("churnRate", calculateChurnRate(allCustomers));
        dashboard.put("engagementScore", calculateAverageEngagement(allCustomers));
        dashboard.put("conversionRate", calculateConversionRate(allInteractions));
        dashboard.put("customerAtRisk", allCustomers.stream().filter(c -> "HIGH".equals(c.getChurnRisk())).count());
        dashboard.put("topCustomers", getTopCustomers(allCustomers, 5));
        dashboard.put("engagementTrends", getEngagementTrends(locationId));
        dashboard.put("conversionFunnel", getConversionFunnel(locationId));
        dashboard.put("roiByChannel", getRoiByChannel(locationId));

        return dashboard;
    }

    public List<CustomerProfile> getCustomersList(String locationId) {
        return profileRepository.findByLocationId(locationId);
    }

    public Map<String, Object> getCustomerLtvAnalysis(String locationId) {
        List<CustomerProfile> customers = profileRepository.findByLocationId(locationId);

        double totalLtv = customers.stream()
                .mapToDouble(c -> c.getEstimatedLifetimeValue() != null ? c.getEstimatedLifetimeValue() : 0)
                .sum();

        double avgLtv = customers.isEmpty() ? 0 : totalLtv / customers.size();

        customers.sort(Comparator.comparingDouble((CustomerProfile c) ->
                c.getEstimatedLifetimeValue() != null ? c.getEstimatedLifetimeValue() : 0).reversed());

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("totalLtv", totalLtv);
        analysis.put("averageLtv", avgLtv);
        analysis.put("medianLtv", calculateMedianLtv(customers));
        analysis.put("topCustomers", customers.stream().limit(20).collect(Collectors.toList()));
        analysis.put("distribution", getLtvDistribution(customers));

        return analysis;
    }

    public Map<String, Object> getChurnAnalysis(String locationId) {
        List<CustomerProfile> allCustomers = profileRepository.findByLocationId(locationId);
        List<CustomerProfile> atRisk = profileRepository.findByLocationIdAndChurnRisk(locationId, "HIGH");
        List<CustomerProfile> lost = profileRepository.findByLocationIdAndStatus(locationId, "LOST");

        double churnRate = allCustomers.isEmpty() ? 0 : (lost.size() * 100.0 / allCustomers.size());

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("totalLostCustomers", lost.size());
        analysis.put("customersAtRisk", atRisk.size());
        analysis.put("churnRate", String.format("%.1f%%", churnRate));
        analysis.put("atRiskCustomers", atRisk.stream().limit(20).collect(Collectors.toList()));
        analysis.put("byMonth", getChurnByMonth(locationId));

        return analysis;
    }

    public Map<String, Object> getConversionFunnel(String locationId) {
        List<CustomerInteraction> interactions = interactionRepository.findByLocationId(locationId);

        long awareness = interactions.stream()
                .filter(i -> "DIRECTION_REQUEST".equals(i.getInteractionType()) ||
                            "POST_CLICK".equals(i.getInteractionType()))
                .count();

        long interest = interactions.stream()
                .filter(i -> "CALL".equals(i.getInteractionType()) ||
                            "EMAIL".equals(i.getInteractionType()))
                .count();

        long consideration = interactions.stream()
                .filter(i -> "INQUIRY".equals(i.getOutcome()))
                .count();

        long decision = interactions.stream()
                .filter(i -> "BOOKING".equals(i.getOutcome()))
                .count();

        long purchase = interactions.stream()
                .filter(i -> "PURCHASE".equals(i.getOutcome()))
                .count();

        Map<String, Object> funnel = new HashMap<>();
        funnel.put("awareness", awareness);
        funnel.put("interest", interest);
        funnel.put("consideration", consideration);
        funnel.put("decision", decision);
        funnel.put("purchase", purchase);
        funnel.put("conversionRate", awareness > 0 ? String.format("%.1f%%", (purchase * 100.0 / awareness)) : "0%");

        return funnel;
    }

    public Map<String, Object> getRoiByChannel(String locationId) {
        List<CustomerInteraction> interactions = interactionRepository.findByLocationId(locationId);

        Map<String, Long> bySource = new HashMap<>();
        Map<String, Long> conversions = new HashMap<>();

        for (CustomerInteraction interaction : interactions) {
            String source = interaction.getSource() != null ? interaction.getSource() : "DIRECT";
            bySource.put(source, bySource.getOrDefault(source, 0L) + 1);

            if ("PURCHASE".equals(interaction.getOutcome()) || "BOOKING".equals(interaction.getOutcome())) {
                conversions.put(source, conversions.getOrDefault(source, 0L) + 1);
            }
        }

        Map<String, Object> roi = new HashMap<>();
        bySource.forEach((source, count) -> {
            long conversionCount = conversions.getOrDefault(source, 0L);
            double rate = count > 0 ? (conversionCount * 100.0 / count) : 0;
            roi.put(source, Map.of(
                    "interactions", count,
                    "conversions", conversionCount,
                    "conversionRate", String.format("%.1f%%", rate)
            ));
        });

        return roi;
    }

    public List<Map<String, Object>> getEngagementTrends(String locationId) {
        List<CustomerInteraction> interactions = interactionRepository.findByLocationId(locationId);

        Map<String, Integer> engagementByDay = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < 30; i++) {
            LocalDateTime day = now.minusDays(i);
            String dateKey = day.toLocalDate().toString();
            engagementByDay.put(dateKey, 0);
        }

        for (CustomerInteraction interaction : interactions) {
            LocalDateTime createdDay = interaction.getCreatedAt();
            if (createdDay != null) {
                String dateKey = createdDay.toLocalDate().toString();
                if (engagementByDay.containsKey(dateKey)) {
                    engagementByDay.put(dateKey, engagementByDay.get(dateKey) + 1);
                }
            }
        }

        return engagementByDay.entrySet().stream()
                .map(e -> Map.of("date", (Object) e.getKey(), "interactions", e.getValue()))
                .sorted(Comparator.comparing((Map<String, Object> m) -> m.get("date").toString()))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getTopCustomers(List<CustomerProfile> customers, int limit) {
        return customers.stream()
                .sorted(Comparator.comparingDouble((CustomerProfile c) ->
                        c.getEstimatedLifetimeValue() != null ? c.getEstimatedLifetimeValue() : 0).reversed())
                .limit(limit)
                .map(c -> Map.of(
                        "name", (Object) c.getContactName(),
                        "ltv", c.getEstimatedLifetimeValue(),
                        "engagementScore", c.getEngagementScore()
                ))
                .collect(Collectors.toList());
    }

    private double calculateAverageLTV(List<CustomerProfile> customers) {
        return customers.stream()
                .mapToDouble(c -> c.getEstimatedLifetimeValue() != null ? c.getEstimatedLifetimeValue() : 0)
                .average()
                .orElse(0);
    }

    private double calculateMedianLtv(List<CustomerProfile> customers) {
        if (customers.isEmpty()) return 0;
        List<Double> values = customers.stream()
                .map(c -> c.getEstimatedLifetimeValue() != null ? c.getEstimatedLifetimeValue() : 0)
                .sorted()
                .collect(Collectors.toList());
        int mid = values.size() / 2;
        return values.size() % 2 == 0 ? (values.get(mid - 1) + values.get(mid)) / 2 : values.get(mid);
    }

    private double calculateChurnRate(List<CustomerProfile> customers) {
        if (customers.isEmpty()) return 0;
        long lost = customers.stream().filter(c -> "LOST".equals(c.getStatus())).count();
        return (lost * 100.0) / customers.size();
    }

    private double calculateAverageEngagement(List<CustomerProfile> customers) {
        return customers.stream()
                .mapToDouble(c -> c.getEngagementScore() != null ? c.getEngagementScore() : 0)
                .average()
                .orElse(0);
    }

    private double calculateConversionRate(List<CustomerInteraction> interactions) {
        if (interactions.isEmpty()) return 0;
        long conversions = interactions.stream()
                .filter(i -> "PURCHASE".equals(i.getOutcome()) || "BOOKING".equals(i.getOutcome()))
                .count();
        return (conversions * 100.0) / interactions.size();
    }

    private Map<String, Object> getLtvDistribution(List<CustomerProfile> customers) {
        int tier1 = (int) customers.stream()
                .filter(c -> c.getEstimatedLifetimeValue() != null && c.getEstimatedLifetimeValue() > 1000)
                .count();
        int tier2 = (int) customers.stream()
                .filter(c -> c.getEstimatedLifetimeValue() != null && c.getEstimatedLifetimeValue() > 500 && c.getEstimatedLifetimeValue() <= 1000)
                .count();
        int tier3 = (int) customers.stream()
                .filter(c -> c.getEstimatedLifetimeValue() != null && c.getEstimatedLifetimeValue() <= 500)
                .count();

        return Map.of("high", tier1, "medium", tier2, "low", tier3);
    }

    private Map<String, Long> getChurnByMonth(String locationId) {
        List<CustomerProfile> lost = profileRepository.findByLocationIdAndStatus(locationId, "LOST");

        Map<String, Long> byMonth = new HashMap<>();
        for (int i = 0; i < 6; i++) {
            LocalDateTime month = LocalDateTime.now().minusMonths(i);
            String monthKey = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            byMonth.put(monthKey, 0L);
        }

        for (CustomerProfile customer : lost) {
            if (customer.getUpdatedAt() != null) {
                LocalDateTime updated = customer.getUpdatedAt();
                String monthKey = updated.getYear() + "-" + String.format("%02d", updated.getMonthValue());
                if (byMonth.containsKey(monthKey)) {
                    byMonth.put(monthKey, byMonth.get(monthKey) + 1);
                }
            }
        }

        return byMonth;
    }

    private List<Map<String, Object>> getEngagementTrendsByScore(String locationId) {
        List<CustomerProfile> customers = profileRepository.findByLocationId(locationId);

        Map<Integer, Integer> scoreDistribution = new HashMap<>();
        for (int i = 0; i <= 100; i += 10) {
            scoreDistribution.put(i, 0);
        }

        for (CustomerProfile customer : customers) {
            Integer score = customer.getEngagementScore() != null ? customer.getEngagementScore() : 0;
            int bucket = (score / 10) * 10;
            scoreDistribution.put(bucket, scoreDistribution.getOrDefault(bucket, 0) + 1);
        }

        return scoreDistribution.entrySet().stream()
                .map(e -> Map.of(
                        "score", (Object) e.getKey(),
                        "count", e.getValue()
                ))
                .sorted(Comparator.comparing((Map<String, Object> m) -> (Integer) m.get("score")))
                .collect(Collectors.toList());
    }
}
