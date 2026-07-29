package com.gmb.manager.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "location_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationMetrics {
    @Id
    private String id;

    private String locationId;
    private LocalDate date;

    // Search Metrics
    private Integer searchViews; // People who searched for your business
    private Integer directionRequests; // People who requested directions
    private Integer phoneClicks; // People who clicked to call
    private Integer websiteClicks; // People who clicked your website

    // Engagement Metrics
    private Integer postViews; // Total views on your posts
    private Integer postEngagements; // Likes, comments, shares
    private Integer totalReviews; // Reviews count
    private Double averageRating; // Star rating

    // Q&A Metrics
    private Integer totalQuestions; // Total Q&A questions
    private Integer unansweredQuestions; // Unanswered Q&A count
    private Integer questionViews; // Views on questions

    // Photo Metrics
    private Integer photoViews; // Total photo views
    private Integer photoClicks; // Clicks from photos

    // Derived Metrics
    private Double costPerClick; // CPM/CPC calculation
    private Double conversionRate; // (Orders / Total Interactions) * 100
    private Integer estimatedRevenue; // Estimated revenue from clicks

    // Trend Data
    private Integer dayOverDayChange; // Change from previous day
    private Double weekOverWeekGrowth; // % change from same day last week
    private Double monthOverMonthGrowth; // % change from same month last year

    // Metadata
    private LocalDateTime fetchedAt; // When metrics were fetched
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
