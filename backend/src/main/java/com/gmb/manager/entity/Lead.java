package com.gmb.manager.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    private String id;

    private String name;

    private String type;

    private String city;

    private String area;

    private String contact;

    private String phone;

    private String email;

    private String product;

    @Field("has_website")
    private Boolean hasWebsite;

    private String gbp;

    private String size;

    @Builder.Default
    private String status = "Pending";

    @Field("callback_time")
    private LocalDateTime callbackTime;

    @Field("call_duration")
    private String callDuration;

    private String notes;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
