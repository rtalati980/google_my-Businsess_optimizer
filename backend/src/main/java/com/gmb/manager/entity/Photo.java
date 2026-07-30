package com.gmb.manager.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    @Id
    private String id;

    private String locationId;
    private String title;
    private String description;
    private String imageUrl;
    private String thumbnailUrl;
    private String category; // INTERIOR, EXTERIOR, PRODUCT, TEAM, FOOD, etc.

    // Quality metrics
    private Integer qualityScore; // 1-100
    private String brightnessFeedback;
    private String clarityFeedback;
    private String compositionFeedback;

    // Analytics
    private Integer views;
    private Integer clicks;
    private Integer conversions;

    // AI suggestions
    private String suggestedCaption;
    private String suggestedTags;
    private Boolean isOptimized;

    // Metadata
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private String status; // DRAFT, PUBLISHED, ARCHIVED

    // Google sync
    private String googlePhotoId;
    private Boolean syncedToGoogle;
    private LocalDateTime lastSyncedAt;
}
