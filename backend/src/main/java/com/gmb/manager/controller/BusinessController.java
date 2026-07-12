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

import com.gmb.manager.service.AiService;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusinessController {

    private final GmbService gmbService;
    private final InsightService insightService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;
    private final AiService aiService;

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
            @PathVariable String locationId,
            @RequestParam(required = false, defaultValue = "false") boolean refresh
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> insights = insightService.getLocationInsights(locationId, user, refresh);
        return ResponseEntity.ok(insights);
    }

    @PutMapping("/locations/{locationId}/profile")
    public ResponseEntity<?> updateLocationProfile(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String name = request.get("name");
        String category = request.get("category");
        String phone = request.get("phone");
        String website = request.get("website");
        String address = request.get("address");
        String description = request.get("description");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Business Name is required");
        }

        Location updated = gmbService.updateLocationProfile(locationId, name, category, phone, website, address, description);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/locations/{locationId}/seo-description")
    public ResponseEntity<?> generateSeoDescription(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody(required = false) Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        List<String> keywords = new ArrayList<>();
        if (request != null && request.containsKey("keywords")) {
            Object kObj = request.get("keywords");
            if (kObj instanceof List) {
                List<?> rawList = (List<?>) kObj;
                for (Object item : rawList) {
                    if (item != null) keywords.add(item.toString());
                }
            }
        }

        String keywordsStr = String.join(", ", keywords);

        String systemInstruction = String.format(
                "You are BizLocalPilot AI, an expert copywriter specializing in Local SEO optimization for Google Business Profiles. " +
                "Write a highly engaging, professional business description (MAXIMUM 750 CHARACTERS) for '%s', which is a '%s' business located in '%s'. " +
                "Naturally incorporate the following local keywords: %s. " +
                "The description must highlight key strengths, services, and why customers choose this business. " +
                "CRITICAL: Do NOT write more than 750 characters total.",
                location.getName(), location.getCategory(), location.getAddress() != null ? location.getAddress() : "", keywordsStr
        );

        String prompt = String.format(
                "Write an optimized Google Business Profile description for:\n" +
                "Business Name: %s\n" +
                "Business Category: %s\n" +
                "Location: %s\n" +
                "Keywords to Include: %s\n\n" +
                "Return ONLY the plain description text. No quotation marks around it, no titles, and no other introductory text.",
                location.getName(), location.getCategory(), location.getAddress() != null ? location.getAddress() : "", keywordsStr
        );

        String generatedDescription = aiService.generateContent(systemInstruction, prompt);

        // Limit character size
        if (generatedDescription != null && generatedDescription.length() > 750) {
            generatedDescription = generatedDescription.substring(0, 747) + "...";
        }

        Map<String, String> response = new HashMap<>();
        response.put("description", generatedDescription != null ? generatedDescription : "");
        return ResponseEntity.ok(response);
    }
}
