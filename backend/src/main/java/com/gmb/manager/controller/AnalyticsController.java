package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/analytics/dashboard")
    public ResponseEntity<?> getDashboard(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> dashboard = analyticsService.getDashboardAnalytics(locationId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/locations/{locationId}/analytics/customers")
    public ResponseEntity<?> getCustomers(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        return ResponseEntity.ok(analyticsService.getCustomersList(locationId));
    }

    @GetMapping("/locations/{locationId}/analytics/customer-ltv")
    public ResponseEntity<?> getCustomerLtv(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analysis = analyticsService.getCustomerLtvAnalysis(locationId);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/locations/{locationId}/analytics/churn-risk")
    public ResponseEntity<?> getChurnAnalysis(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analysis = analyticsService.getChurnAnalysis(locationId);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/locations/{locationId}/analytics/conversion-funnel")
    public ResponseEntity<?> getConversionFunnel(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> funnel = analyticsService.getConversionFunnel(locationId);
        return ResponseEntity.ok(funnel);
    }

    @GetMapping("/locations/{locationId}/analytics/roi-by-channel")
    public ResponseEntity<?> getRoiByChannel(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> roi = analyticsService.getRoiByChannel(locationId);
        return ResponseEntity.ok(roi);
    }

    @GetMapping("/locations/{locationId}/analytics/trends")
    public ResponseEntity<?> getEngagementTrends(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        return ResponseEntity.ok(analyticsService.getEngagementTrends(locationId));
    }
}
