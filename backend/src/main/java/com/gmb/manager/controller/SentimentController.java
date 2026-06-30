package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SentimentController {

    private final ReviewService reviewService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/sentiment")
    public ResponseEntity<?> getSentimentAnalysis(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analysis = reviewService.getSentimentAnalysis(locationId);
        return ResponseEntity.ok(analysis);
    }
}
