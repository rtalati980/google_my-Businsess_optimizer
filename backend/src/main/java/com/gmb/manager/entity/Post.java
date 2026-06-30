package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    private String id;

    @Field("location_id")
    @JsonIgnore
    private String locationId;

    private String topic;

    private String content;

    @Field("media_url")
    private String mediaUrl;

    @Field("post_type")
    private String postType; // "WEEKLY", "FESTIVAL", "PROMOTION", "PRODUCT"

    @Builder.Default
    private String status = "DRAFT"; // "DRAFT", "PUBLISHED", "SCHEDULED"

    @Field("scheduled_at")
    private LocalDateTime scheduledAt;

    @Field("published_at")
    private LocalDateTime publishedAt;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
