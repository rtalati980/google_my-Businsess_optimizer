package com.gmb.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for a professional service listed in the marketplace.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalServiceDto {
    private Long id;
    private String name;
    private String description;
    private String estimatedTimeline;
    private String startingPrice;
    private String expectedImpact;
    private double rating;
    private List<String> tags;
    private String icon;
}
