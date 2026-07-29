package com.gmb.manager.service;

import com.gmb.manager.entity.KeywordTracking;
import com.gmb.manager.entity.Location;
import com.gmb.manager.repository.KeywordTrackingRepository;
import com.gmb.manager.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeywordTrackingService {

    private final KeywordTrackingRepository keywordRepository;
    private final LocationRepository locationRepository;
    private final AiService aiService;

    public KeywordTracking addKeyword(String locationId, String keyword, String keywordType, String intent) {
        KeywordTracking existing = keywordRepository.findByLocationIdAndKeyword(locationId, keyword);
        if (existing != null) {
            throw new IllegalArgumentException("Keyword already being tracked");
        }

        // Get location for business context
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        // Generate AI keyword description (no rank yet)
        String description = aiService.generateKeywordDescription(
                keyword,
                location.getName(),
                location.getCategory() != null ? location.getCategory() : "Business",
                null,  // No rank yet
                0      // Volume unknown initially
        );

        KeywordTracking tracking = KeywordTracking.builder()
                .locationId(locationId)
                .keyword(keyword)
                .keywordType(keywordType)
                .intent(intent)
                .description(description) // ← AI-generated description
                .descriptionGeneratedAt(LocalDateTime.now()) // ← Track when generated
                .currentRank(null)
                .previousRank(null)
                .monthlySearchVolume(0)
                .impressions(0)
                .clicks(0)
                .conversions(0)
                .clickThroughRate(0.0)
                .usedInPosts(false)
                .usedInDescription(false)
                .usedInBusinessName(false)
                .rankingHistory(new ArrayList<>())
                .addedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        log.info("Added keyword '{}' with AI-generated description for location {}", keyword, locationId);
        return keywordRepository.save(tracking);
    }

    public KeywordTracking updateRank(String keywordId, Integer newRank) {
        KeywordTracking tracking = keywordRepository.findById(keywordId)
                .orElseThrow(() -> new IllegalArgumentException("Keyword not found"));

        tracking.setPreviousRank(tracking.getCurrentRank());
        tracking.setCurrentRank(newRank);

        if (tracking.getPreviousRank() != null) {
            tracking.setRankChange(tracking.getPreviousRank() - newRank);
            if (newRank < tracking.getPreviousRank()) {
                tracking.setRankTrend("UP");
            } else if (newRank > tracking.getPreviousRank()) {
                tracking.setRankTrend("DOWN");
            } else {
                tracking.setRankTrend("STABLE");
            }
        }

        tracking.setLastTrackedAt(LocalDateTime.now());
        tracking.setUpdatedAt(LocalDateTime.now());

        // Add to ranking history
        if (tracking.getRankingHistory() == null) {
            tracking.setRankingHistory(new ArrayList<>());
        }
        tracking.getRankingHistory().add(KeywordTracking.RankingHistory.builder()
                .date(LocalDateTime.now())
                .rank(newRank)
                .impressions(tracking.getImpressions())
                .clicks(tracking.getClicks())
                .build());

        // Regenerate description with updated rank information
        try {
            Location location = locationRepository.findById(tracking.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("Location not found"));

            String updatedDescription = aiService.generateKeywordDescription(
                    tracking.getKeyword(),
                    location.getName(),
                    location.getCategory() != null ? location.getCategory() : "Business",
                    newRank,  // ← Now include current rank for better insights
                    tracking.getMonthlySearchVolume()
            );

            tracking.setDescription(updatedDescription); // ← Update with new insights
            tracking.setDescriptionGeneratedAt(LocalDateTime.now());
            log.info("Updated keyword description for '{}' with new rank #{}", tracking.getKeyword(), newRank);
        } catch (Exception e) {
            log.warn("Failed to regenerate description for keyword '{}': {}", tracking.getKeyword(), e.getMessage());
            // Continue even if description generation fails - don't break rank updates
        }

        return keywordRepository.save(tracking);
    }

    public KeywordTracking updateMetrics(String keywordId, Integer impressions, Integer clicks, Integer conversions) {
        KeywordTracking tracking = keywordRepository.findById(keywordId)
                .orElseThrow(() -> new IllegalArgumentException("Keyword not found"));

        tracking.setImpressions(impressions);
        tracking.setClicks(clicks);
        tracking.setConversions(conversions);

        if (impressions > 0) {
            tracking.setClickThroughRate((double) clicks / impressions * 100);
        }

        tracking.setUpdatedAt(LocalDateTime.now());
        return keywordRepository.save(tracking);
    }

    public List<KeywordTracking> getLocationKeywords(String locationId) {
        return keywordRepository.findByLocationId(locationId);
    }

    public Page<KeywordTracking> getLocationKeywordsPage(String locationId, Pageable pageable) {
        return keywordRepository.findByLocationId(locationId, pageable);
    }

    public KeywordTracking getKeyword(String keywordId) {
        return keywordRepository.findById(keywordId)
                .orElseThrow(() -> new IllegalArgumentException("Keyword not found"));
    }

    public void removeKeyword(String keywordId) {
        keywordRepository.deleteById(keywordId);
    }

    public Map<String, Object> getKeywordAnalytics(String locationId) {
        List<KeywordTracking> keywords = getLocationKeywords(locationId);

        // Top ranking keywords
        List<KeywordTracking> topRanking = keywords.stream()
                .filter(k -> k.getCurrentRank() != null && k.getCurrentRank() <= 10)
                .sorted(Comparator.comparing(KeywordTracking::getCurrentRank))
                .limit(5)
                .toList();

        // Keywords with improvement
        List<KeywordTracking> improving = keywords.stream()
                .filter(k -> "UP".equals(k.getRankTrend()))
                .sorted(Comparator.comparingInt(KeywordTracking::getRankChange).reversed())
                .limit(5)
                .toList();

        int totalKeywords = keywords.size();
        int rankedKeywords = (int) keywords.stream().filter(k -> k.getCurrentRank() != null).count();
        int topTenKeywords = (int) keywords.stream()
                .filter(k -> k.getCurrentRank() != null && k.getCurrentRank() <= 10).count();
        int topThreeKeywords = (int) keywords.stream()
                .filter(k -> k.getCurrentRank() != null && k.getCurrentRank() <= 3).count();

        return Map.of(
                "totalKeywords", totalKeywords,
                "rankedKeywords", rankedKeywords,
                "topTenKeywords", topTenKeywords,
                "topThreeKeywords", topThreeKeywords,
                "topRankingKeywords", topRanking,
                "improvingKeywords", improving,
                "averageCTR", keywords.stream().mapToDouble(KeywordTracking::getClickThroughRate).average().orElse(0),
                "totalImpressions", keywords.stream().mapToInt(KeywordTracking::getImpressions).sum(),
                "totalClicks", keywords.stream().mapToInt(KeywordTracking::getClicks).sum(),
                "totalConversions", keywords.stream().mapToInt(KeywordTracking::getConversions).sum()
        );
    }

    public List<KeywordTracking> getTopOpportunities(String locationId) {
        List<KeywordTracking> keywords = getLocationKeywords(locationId);
        return keywords.stream()
                .filter(k -> k.getMonthlySearchVolume() > 10 && (k.getCurrentRank() == null || k.getCurrentRank() > 15))
                .sorted(Comparator.comparingInt(KeywordTracking::getMonthlySearchVolume).reversed())
                .limit(10)
                .toList();
    }

    public Map<String, Integer> keywordDistribution(String locationId) {
        List<KeywordTracking> keywords = getLocationKeywords(locationId);
        return keywords.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        k -> k.getKeywordType() != null ? k.getKeywordType() : "OTHER",
                        java.util.stream.Collectors.collectingAndThen(
                                java.util.stream.Collectors.toList(),
                                List::size
                        )
                ));
    }

    public void markKeywordAsUsedInPosts(String keywordId) {
        KeywordTracking tracking = getKeyword(keywordId);
        tracking.setUsedInPosts(true);
        keywordRepository.save(tracking);
    }

    public void markKeywordAsUsedInDescription(String keywordId) {
        KeywordTracking tracking = getKeyword(keywordId);
        tracking.setUsedInDescription(true);
        keywordRepository.save(tracking);
    }
}
