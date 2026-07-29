package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.KeywordTracking;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.KeywordTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations/{locationId}/keywords")
@RequiredArgsConstructor
public class KeywordController {

    private final KeywordTrackingService keywordService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addKeyword(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String keyword = request.get("keyword");
        String keywordType = request.getOrDefault("keywordType", "LOCAL");
        String intent = request.getOrDefault("intent", "COMMERCIAL");

        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Keyword is required"));
        }

        try {
            KeywordTracking tracking = keywordService.addKeyword(locationId, keyword, keywordType, intent);
            return ResponseEntity.ok(tracking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getKeywords(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Pageable pageable = PageRequest.of(page, size, Sort.by("currentRank").descending());
        Page<KeywordTracking> keywords = keywordService.getLocationKeywordsPage(locationId, pageable);
        return ResponseEntity.ok(keywords);
    }

    @GetMapping("/{keywordId}")
    public ResponseEntity<?> getKeyword(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String keywordId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        KeywordTracking keyword = keywordService.getKeyword(keywordId);
        return ResponseEntity.ok(keyword);
    }

    @PutMapping("/{keywordId}/rank")
    public ResponseEntity<?> updateRank(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String keywordId,
            @RequestBody Map<String, Integer> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Integer newRank = request.get("rank");
        if (newRank == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rank is required"));
        }

        KeywordTracking updated = keywordService.updateRank(keywordId, newRank);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{keywordId}/metrics")
    public ResponseEntity<?> updateMetrics(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String keywordId,
            @RequestBody Map<String, Integer> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Integer impressions = request.get("impressions");
        Integer clicks = request.get("clicks");
        Integer conversions = request.getOrDefault("conversions", 0);

        KeywordTracking updated = keywordService.updateMetrics(keywordId, impressions, clicks, conversions);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{keywordId}")
    public ResponseEntity<?> removeKeyword(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String keywordId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        keywordService.removeKeyword(keywordId);
        return ResponseEntity.ok(Map.of("message", "Keyword removed"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analytics = keywordService.getKeywordAnalytics(locationId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/opportunities")
    public ResponseEntity<?> getTopOpportunities(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        List<KeywordTracking> opportunities = keywordService.getTopOpportunities(locationId);
        return ResponseEntity.ok(opportunities);
    }

    @GetMapping("/distribution")
    public ResponseEntity<?> getDistribution(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Integer> distribution = keywordService.keywordDistribution(locationId);
        return ResponseEntity.ok(distribution);
    }
}
