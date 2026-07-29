package com.gmb.manager.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "keyword_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordTracking {
    @Id
    private String id;

    private String locationId;
    private String keyword;

    // Ranking data
    private Integer currentRank; // Position in Google Maps/Search
    private Integer previousRank;
    private Integer rankChange;
    private String rankTrend; // UP, DOWN, STABLE

    // Search volume
    private Integer monthlySearchVolume;
    private String difficulty; // EASY, MEDIUM, HARD

    // Performance metrics
    private Integer impressions;
    private Integer clicks;
    private Double clickThroughRate;
    private Integer conversions;

    // Competitor tracking
    private List<String> competitorRanks;
    private Integer competitorAvgRank;
    private String competitiveOpportunity; // HIGH, MEDIUM, LOW

    // Optimization
    private Boolean usedInPosts;
    private Boolean usedInDescription;
    private Boolean usedInBusinessName;
    private List<String> suggestedContentTopics;

    // Metadata
    private String keywordType; // LOCAL, BRANDED, PRODUCT_SERVICE
    private String intent; // COMMERCIAL, INFORMATIONAL, NAVIGATIONAL
    private LocalDateTime addedAt;
    private LocalDateTime lastTrackedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Ranking history for charts
    private List<RankingHistory> rankingHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankingHistory {
        private LocalDateTime date;
        private Integer rank;
        private Integer impressions;
        private Integer clicks;
    }
}
