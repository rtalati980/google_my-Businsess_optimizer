package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "seo_audits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SEOAudit {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Field("seo_score")
    private Integer seoScore;

    @Field("keyword_suggestions")
    private String keywordSuggestions;

    @Field("profile_suggestions")
    private String profileSuggestions;

    @Field("competitor_insights")
    private String competitorInsights;

    @Field("created_at")
    private LocalDateTime createdAt;
}
