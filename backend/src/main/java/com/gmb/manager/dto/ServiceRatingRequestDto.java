package com.gmb.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for submitting a rating for a professional service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRatingRequestDto {
    private double rating; // Expected range 0.0 - 5.0
}
