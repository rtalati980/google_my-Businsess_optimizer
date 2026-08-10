package com.gmb.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for GrowthOpportunity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GrowthOpportunityDto {
    private Long id;
    private String serviceName;
    private String businessProblem;
    private String description;
    private String estimatedImpact;
    private String priority; // VERY_HIGH, HIGH, MEDIUM, LOW
    private String estimatedTime;
    private String icon;
}
