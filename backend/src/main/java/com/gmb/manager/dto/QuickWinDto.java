package com.gmb.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for a quick win recommendation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuickWinDto {
    private String title;
    private String impactLevel; // e.g., "★★★★★"
    private String estimatedTime; // optional, can be null
    private String ctaLabel; // button text
}
