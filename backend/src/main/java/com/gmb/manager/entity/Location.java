package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    private String id;

    @Field("business_id")
    @JsonIgnore
    private String businessId;

    @Indexed(unique = true)
    @Field("google_location_id")
    private String googleLocationId;

    private String name;

    private String address;

    private String phone;

    private String website;

    private String category;

    private Double latitude;

    private Double longitude;

    // Notification settings
    @Field("notify_enabled")
    @Builder.Default
    private Boolean notifyEnabled = false;

    @Field("notify_email")
    private String notifyEmail;

    @Field("notify_on_rating_below")
    @Builder.Default
    private Integer notifyOnRatingBelow = 3;

    // Auto-reply settings embedded
    @Field("auto_reply_settings")
    @Builder.Default
    private AutoReplySettings autoReplySettings = new AutoReplySettings();

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
