package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "usage_trackers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageTracker {

    @Id
    private String id;

    @Field("user_id")
    @JsonIgnore
    private String userId;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Field("plan_type")
    private String planType; // BASIC, PREMIUM, etc.

    @Field("review_requests_used")
    private Integer reviewRequestsUsed;

    @Field("review_requests_limit")
    private Integer reviewRequestsLimit; // Monthly limit

    @Field("optimized_posts_used")
    private Integer optimizedPostsUsed;

    @Field("optimized_posts_limit")
    private Integer optimizedPostsLimit;

    @Field("customer_profiles_used")
    private Integer customerProfilesUsed;

    @Field("customer_profiles_limit")
    private Integer customerProfilesLimit;

    @Field("analytics_reports_used")
    private Integer analyticsReportsUsed;

    @Field("analytics_reports_limit")
    private Integer analyticsReportsLimit;

    @Field("ai_reply_suggestions_used")
    private Integer aiReplySuggestionsUsed;

    @Field("ai_reply_suggestions_limit")
    private Integer aiReplySuggestionsLimit;

    @Field("billing_period_start")
    private LocalDateTime billingPeriodStart;

    @Field("billing_period_end")
    private LocalDateTime billingPeriodEnd;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
