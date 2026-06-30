package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "ai_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIReport {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Field("start_date")
    private LocalDate startDate;

    @Field("end_date")
    private LocalDate endDate;

    private String summary;

    @Field("sentiment_analysis")
    private String sentimentAnalysis;

    @Field("seo_recommendations")
    private String seoRecommendations;

    @Field("content_recommendations")
    private String contentRecommendations;

    @Field("growth_opportunities")
    private String growthOpportunities;

    @Field("created_at")
    private LocalDateTime createdAt;
}
