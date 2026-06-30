package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.AdvisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
@RequiredArgsConstructor
public class AdvisorController {

    private final AdvisorService advisorService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/growth-plan")
    public ResponseEntity<?> getGrowthPlan(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        var location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).build();

        String plan = advisorService.generateGrowthPlan(locationId);
        return ResponseEntity.ok(Map.of("plan", plan, "locationId", locationId));
    }

    @PostMapping("/locations/{locationId}/ask")
    public ResponseEntity<?> askQuestion(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, String> body
    ) {
        var location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).build();

        String question = body.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body("question is required");
        }

        String answer = advisorService.askAdvisor(locationId, question);
        return ResponseEntity.ok(Map.of("answer", answer, "question", question));
    }
}
