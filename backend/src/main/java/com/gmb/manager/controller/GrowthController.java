package com.gmb.manager.controller;

import com.gmb.manager.dto.GrowthOpportunityDto;
import com.gmb.manager.dto.BusinessScoreDto;
import com.gmb.manager.dto.ChecklistItemDto;
import com.gmb.manager.dto.QuickWinDto;
import com.gmb.manager.service.GrowthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/**
 * Exposes premium growth related data.
 */
@RestController
@RequestMapping("/api/growth")
public class GrowthController {

    private final GrowthService growthService;

    public GrowthController(GrowthService growthService) {
        this.growthService = growthService;
    }

    @GetMapping("/opportunities")
    public ResponseEntity<List<GrowthOpportunityDto>> getGrowthOpportunities() {
        return ResponseEntity.ok(growthService.getAllOpportunities());
    }

    // Placeholder implementations – replace with real calculations later.
    @GetMapping("/business-score")
    public ResponseEntity<BusinessScoreDto> getBusinessScore() {
        BusinessScoreDto score = new BusinessScoreDto(68, 12, 45, 120, "₹80,000 - ₹2,40,000");
        return ResponseEntity.ok(score);
    }

    @GetMapping("/quick-wins")
    public ResponseEntity<List<QuickWinDto>> getQuickWins() {
        // Sample static data – in real app, pull from DB or service.
        List<QuickWinDto> quickWins = List.of(
                new QuickWinDto("Reply to 12 Reviews", "★★★★★", "15 Minutes", "Generate Replies"),
                new QuickWinDto("Upload 20 Photos", "★★★★★", null, "View Guide"),
                new QuickWinDto("Add Missing Services", "★★★★☆", null, "Complete Now")
        );
        return ResponseEntity.ok(quickWins);
    }

    @GetMapping("/checklist")
    public ResponseEntity<List<ChecklistItemDto>> getBusinessChecklist() {
        List<ChecklistItemDto> items = List.of(
                new ChecklistItemDto("Google Verification", true),
                new ChecklistItemDto("Categories", true),
                new ChecklistItemDto("Business Description", false),
                new ChecklistItemDto("Photos", true),
                new ChecklistItemDto("Reviews", false),
                new ChecklistItemDto("Website", false),
                new ChecklistItemDto("Booking Link", false),
                new ChecklistItemDto("WhatsApp", false),
                new ChecklistItemDto("Products", true),
                new ChecklistItemDto("Services", false),
                new ChecklistItemDto("Opening Hours", true),
                new ChecklistItemDto("FAQ", false),
                new ChecklistItemDto("Posts", true),
                new ChecklistItemDto("Attributes", true),
                new ChecklistItemDto("Logo", true),
                new ChecklistItemDto("Cover Photo", false)
        );
        return ResponseEntity.ok(items);
    }
}
