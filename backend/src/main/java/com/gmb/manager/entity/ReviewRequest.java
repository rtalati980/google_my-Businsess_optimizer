package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "review_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Field("customer_phone")
    private String customerPhone;

    @Field("customer_email")
    private String customerEmail;

    @Field("customer_name")
    private String customerName;

    @Field("request_type")
    private String requestType; // "SMS", "EMAIL", "WHATSAPP"

    @Builder.Default
    @Field("status")
    private String status = "PENDING"; // "PENDING", "SENT", "RESPONDED", "COMPLETED"

    @Field("template_type")
    private String templateType; // "AUTO_GENERATED"

    @Field("generated_message")
    private String generatedMessage;

    @Field("sent_at")
    private LocalDateTime sentAt;

    @Field("responded_at")
    private LocalDateTime respondedAt;

    @Field("review_created_at")
    private LocalDateTime reviewCreatedAt;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
