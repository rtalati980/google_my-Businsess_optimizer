package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    @Indexed(unique = true)
    @Field("google_review_id")
    private String googleReviewId;

    @Field("reviewer_name")
    private String reviewerName;

    @Field("reviewer_profile_photo")
    private String reviewerProfilePhoto;

    private Integer rating;

    private String comment;

    @Builder.Default
    private String status = "UNANSWERED"; // "UNANSWERED", "ANSWERED"

    @Field("google_created_time")
    private LocalDateTime googleCreatedTime;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
