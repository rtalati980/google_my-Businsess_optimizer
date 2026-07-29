package com.gmb.manager.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "google_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleQuestion {
    @Id
    private String id;

    private String locationId;
    private String googleQuestionId;

    private String question;
    private String author;
    private String authorPhoto;
    private LocalDateTime askedAt;

    // Answer details
    private String answer;
    private String answerAuthor;
    private LocalDateTime answeredAt;
    private Boolean isAnswered;
    private String answerStatus; // PENDING, PUBLISHED, DRAFT, REJECTED

    // AI-generated suggestions
    private String aiSuggestedAnswer;
    private String aiConfidence; // HIGH, MEDIUM, LOW
    private String questionCategory; // SERVICE, PRODUCT, LOCATION, OTHER

    // Engagement
    private Integer upvotes;
    private Integer downvotes;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status; // ACTIVE, ARCHIVED, SPAM
}
