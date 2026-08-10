package com.gmb.manager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a premium growth opportunity recommendation.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GrowthOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String serviceName; // e.g., "Professional Website"

    @Column(length = 1024)
    private String businessProblem;

    @Column(length = 2048)
    private String description; // detailed description / benefits

    @Column(nullable = false)
    private String estimatedImpact; // e.g., "More Leads, Better SEO"

    @Column(nullable = false)
    private String priority; // VERY_HIGH, HIGH, MEDIUM, LOW

    @Column(nullable = false)
    private String estimatedTime; // e.g., "5-10 Days"

    @Column(nullable = false)
    private String icon; // name of icon resource
}
