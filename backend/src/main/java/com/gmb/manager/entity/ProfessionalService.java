package com.gmb.manager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Represents a professional service that can be purchased/hired through the marketplace.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 2048)
    private String description;

    @Column(nullable = false)
    private String estimatedTimeline; // e.g., "5-10 Days"

    @Column
    private String startingPrice; // could be a range like "₹20,000 - ₹30,000"

    @Column(nullable = false)
    private String expectedImpact; // e.g., "Increase Leads"

    @Column(nullable = false)
    private double rating; // average customer rating 0-5

    @ElementCollection
    private List<String> tags; // e.g., ["Most Popular", "Best ROI"]

    @Column(nullable = false)
    private String icon; // icon name or path
}
