package com.gmb.manager.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "business_info_optimization")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessInfoOptimization {
    @Id
    private String id;

    private String locationId;

    // Completeness scoring
    private Integer completenessScore; // 0-100
    private Integer businessNameScore;
    private Integer addressScore;
    private Integer phoneScore;
    private Integer websiteScore;
    private Integer hoursScore;
    private Integer serviceAreaScore;
    private Integer descriptionScore;
    private Integer attributesScore;
    private Integer categoryScore;

    // Missing information alerts
    private List<String> missingFields;
    private List<String> optimizationSuggestions;

    // Business information status
    private Boolean hasBusinessName;
    private Boolean hasFullAddress;
    private Boolean hasPhone;
    private Boolean hasWebsite;
    private Boolean hasBusinessHours;
    private Boolean hasServiceArea;
    private Boolean hasDescription;
    private Boolean hasAttributes;
    private Boolean hasCategories;

    // Service area details
    private List<String> serviceAreas;
    private Boolean deliveryAvailable;
    private Boolean onlineOrdersAvailable;
    private Boolean dineInAvailable;
    private Boolean takeoutAvailable;

    // Attributes
    private Map<String, Boolean> attributes; // wifi, parking, wheelchair_access, etc.

    // Metadata
    private LocalDateTime lastAuditedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Competitive benchmarking
    private Integer competitorAverageScore;
    private Integer yourPercentileRank;
}
