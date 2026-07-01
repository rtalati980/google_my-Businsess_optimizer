package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "customer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfile {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Field("contact_phone")
    private String contactPhone;

    @Field("contact_email")
    private String contactEmail;

    @Field("contact_name")
    private String contactName;

    @Field("first_contact_date")
    private LocalDateTime firstContactDate;

    @Field("last_contact_date")
    private LocalDateTime lastContactDate;

    @Field("total_interactions")
    private Integer totalInteractions; // count

    @Field("total_purchases")
    private Integer totalPurchases; // count/frequency

    @Field("estimated_lifetime_value")
    private Double estimatedLifetimeValue; // in USD or local currency

    @Field("engagement_score")
    private Integer engagementScore; // 0-100

    @Field("churn_risk")
    private String churnRisk; // HIGH, MEDIUM, LOW

    @Field("preferred_channel")
    private String preferredChannel; // CALL, SMS, EMAIL, WHATSAPP

    private List<String> tags; // Custom labels for segmentation

    @Field("last_purchase_date")
    private LocalDateTime lastPurchaseDate;

    @Field("last_purchase_amount")
    private Double lastPurchaseAmount;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, LOST

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
