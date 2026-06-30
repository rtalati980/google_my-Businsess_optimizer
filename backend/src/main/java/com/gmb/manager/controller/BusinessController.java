package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.GmbService;
import com.gmb.manager.service.InsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusinessController {

    private final GmbService gmbService;
    private final InsightService insightService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/businesses")
    public ResponseEntity<?> getBusinesses(@AuthenticationPrincipal User user) {
        try {
            List<Business> businesses = gmbService.connectAndSyncGmb(user);
            return ResponseEntity.ok(businesses);
        } catch (RuntimeException e) {
            return buildGmbErrorResponse(e);
        }
    }

    @PostMapping("/businesses/connect")
    public ResponseEntity<?> connectBusiness(@AuthenticationPrincipal User user) {
        try {
            List<Business> businesses = gmbService.connectAndSyncGmb(user);
            return ResponseEntity.ok(businesses);
        } catch (RuntimeException e) {
            return buildGmbErrorResponse(e);
        }
    }

    private ResponseEntity<?> buildGmbErrorResponse(RuntimeException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Unknown error";
        if (msg.startsWith("GMB_API_QUOTA_EXCEEDED")) {
            return ResponseEntity.status(503).body(Map.of(
                "error", "GMB_API_QUOTA_EXCEEDED",
                "message", "Google Business Profile API access has not been granted for this project. " +
                           "Please request API access at https://developers.google.com/my-business/content/prereqs",
                "docsUrl", "https://developers.google.com/my-business/content/prereqs"
            ));
        }
        return ResponseEntity.status(502).body(Map.of(
            "error", "GMB_API_ERROR",
            "message", msg
        ));
    }

    @PostMapping("/businesses/disconnect")
    public ResponseEntity<?> disconnectBusiness(@AuthenticationPrincipal User user) {
        gmbService.disconnectGmb(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Location>> getLocations(@AuthenticationPrincipal User user) {
        List<Business> businesses = businessRepository.findByUserId(user.getId());
        List<Location> locations = new ArrayList<>();
        for (Business b : businesses) {
            locations.addAll(locationRepository.findByBusinessId(b.getId()));
        }
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/locations/{locationId}")
    public ResponseEntity<?> getLocation(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(location);
    }

    @GetMapping("/locations/{locationId}/insights")
    public ResponseEntity<?> getInsights(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> insights = insightService.getLocationInsights(locationId, user);
        return ResponseEntity.ok(insights);
    }
}
