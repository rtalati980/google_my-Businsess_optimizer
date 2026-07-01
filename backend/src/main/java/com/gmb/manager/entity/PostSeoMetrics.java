package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "post_seo_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostSeoMetrics {

    @Id
    private String id;

    @Field("post_id")
    private String postId;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Field("seo_score")
    private Integer seoScore; // 0-100

    @Field("target_keywords")
    private List<String> targetKeywords;

    @Field("keyword_density")
    private Double keywordDensity; // percentage

    @Field("estimated_reach")
    private Integer estimatedReach; // 0-100 visibility score

    @Field("readability_score")
    private Double readabilityScore; // Flesch reading ease

    @Field("call_to_action_present")
    private Boolean callToActionPresent;

    @Field("locality_mentions")
    private Integer localityMentions; // count of location references

    @Field("published_impressions")
    private Long publishedImpressions; // tracked after publishing

    @Field("published_engagements")
    private Long publishedEngagements; // clicks/interactions

    @Field("content_length")
    private Integer contentLength; // word count

    @Field("hashtag_count")
    private Integer hashtagCount;

    @Field("emoji_count")
    private Integer emojiCount;

    @Field("mobile_optimized")
    private Boolean mobileOptimized;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
