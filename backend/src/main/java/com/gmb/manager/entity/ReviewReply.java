package com.gmb.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "review_replies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReply {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("review_id")
    @JsonIgnore
    private String reviewId;

    @Field("reply_text")
    private String replyText;

    @Field("is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Field("generated_by")
    private String generatedBy; // "AI", "MANUAL"

    private String tone; // "PROFESSIONAL", "FRIENDLY", "LUXURY", "HEALTHCARE", "RESTAURANT"

    @Field("published_at")
    private LocalDateTime publishedAt;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
