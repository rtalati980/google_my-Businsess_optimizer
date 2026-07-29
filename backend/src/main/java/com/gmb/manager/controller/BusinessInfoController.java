package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.BusinessInfoOptimization;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.BusinessInfoOptimizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations/{locationId}/business-info")
@RequiredArgsConstructor
public class BusinessInfoController {

    private final BusinessInfoOptimizationService optimizationService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeBusinessInfo(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        BusinessInfoOptimization optimization = optimizationService.analyzeBusinessInfo(locationId);
        return ResponseEntity.ok(optimization);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getOptimizationStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        try {
            Map<String, Object> status = optimizationService.getOptimizationStatus(locationId);
            return ResponseEntity.ok(status);
        } catch (IllegalArgumentException e) {
            // If no optimization data exists, analyze first
            BusinessInfoOptimization optimization = optimizationService.analyzeBusinessInfo(locationId);
            Map<String, Object> status = optimizationService.getOptimizationStatus(locationId);
            return ResponseEntity.ok(status);
        }
    }

    @PutMapping("/service-area")
    public ResponseEntity<?> updateServiceArea(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        @SuppressWarnings("unchecked")
        List<String> serviceAreas = (List<String>) request.get("serviceAreas");
        optimizationService.updateServiceArea(locationId, serviceAreas);
        return ResponseEntity.ok(Map.of("message", "Service area updated"));
    }

    @PutMapping("/attributes")
    public ResponseEntity<?> updateAttributes(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        @SuppressWarnings("unchecked")
        Map<String, Boolean> attributes = (Map<String, Boolean>) request.get("attributes");
        optimizationService.updateAttributes(locationId, attributes);
        return ResponseEntity.ok(Map.of("message", "Attributes updated"));
    }
}
