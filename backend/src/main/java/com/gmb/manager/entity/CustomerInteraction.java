package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "customer_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerInteraction {

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

    @Field("interaction_type")
    private String interactionType; // CALL, SMS, EMAIL, REVIEW, VISIT, POST_CLICK, DIRECTION_REQUEST

    @Field("source")
    private String source; // Where interaction came from (POST_ID, REVIEW, GMB_PROFILE, WEBSITE, etc.)

    private Long timestamp; // Unix timestamp for better querying

    @Field("metadata")
    private Map<String, String> metadata; // Extra data (post ID, review ID, etc.)

    @Field("outcome")
    private String outcome; // NONE, INQUIRY, BOOKING, PURCHASE, FOLLOW_UP

    private String notes;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
