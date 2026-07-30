package com.gmb.manager.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Festival {
    private String id;
    private String name; // Diwali, Rakhi, Holi, etc.
    private String month; // October, August, March, etc.
    private LocalDate expectedDate; // 2026 date
    private String description;
    private List<String> applicableBusinessCategories; // Restaurant, Retail, etc.
    private String suggestedTheme; // "Celebration", "Gratitude", "Joy", etc.
    private List<String> seoKeywords; // Keywords for ranking
    private List<String> suggestedOffers; // "Special Diwali Discount", "Rakhi Special Offer", etc.
    private List<String> contentTemplates; // Pre-written post templates
    private Integer seoRankingBoost; // Potential ranking boost (1-10)
}
