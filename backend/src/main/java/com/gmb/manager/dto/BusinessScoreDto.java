package com.gmb.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing the overall business growth score and related metrics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessScoreDto {
    /**
     * Score out of 100.
     */
    private int score; // e.g., 68

    /**
     * Number of opportunities found.
     */
    private int opportunitiesFound;

    /**
     * Estimated additional visibility percentage.
     */
    private int additionalVisibilityPercent; // e.g., 45

    /**
     * Potential monthly leads increase.
     */
    private int potentialLeadsIncrease; // e.g., 120

    /**
     * Estimated revenue growth range (display string).
     */
    private String revenueGrowthRange; // e.g., "₹80,000 - ₹2,40,000"
}
