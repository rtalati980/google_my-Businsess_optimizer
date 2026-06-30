package com.gmb.manager.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Embedded inside Location document — not a top-level MongoDB collection.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoReplySettings {

    @Builder.Default
    private Boolean enabled = false;

    /** Tone for AI reply: FRIENDLY, PROFESSIONAL, LUXURY, HEALTHCARE, RESTAURANT */
    @Builder.Default
    private String tone = "FRIENDLY";

    /** Only auto-reply to reviews with rating >= minRating */
    @Field("min_rating")
    @Builder.Default
    private Integer minRating = 1;

    /** Only auto-reply to reviews with rating <= maxRating */
    @Field("max_rating")
    @Builder.Default
    private Integer maxRating = 5;

    /** Minutes to wait after a review arrives before auto-replying */
    @Field("delay_minutes")
    @Builder.Default
    private Integer delayMinutes = 30;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
