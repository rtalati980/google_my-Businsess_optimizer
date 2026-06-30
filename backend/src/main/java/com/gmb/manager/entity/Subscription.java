package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("user_id")
    @JsonIgnore
    private String userId;

    @Indexed(unique = true, sparse = true)
    @Field("stripe_subscription_id")
    private String stripeSubscriptionId;

    @Field("stripe_customer_id")
    private String stripeCustomerId;

    private String status; // "ACTIVE", "TRIALING", "CANCELED", "PAST_DUE"

    @Field("plan_type")
    private String planType; // "BASIC", "PREMIUM"

    @Field("current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
