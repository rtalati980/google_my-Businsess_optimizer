package com.gmb.manager.controller;

import com.gmb.manager.entity.*;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AutoReplyController {

    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business business = businessRepository.findById(location.getBusinessId()).orElse(null);
        return business != null && business.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/auto-reply-settings")
    public ResponseEntity<?> getSettings(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        AutoReplySettings s = location.getAutoReplySettings() != null
                ? location.getAutoReplySettings()
                : new AutoReplySettings();

        return ResponseEntity.ok(Map.of(
                "enabled", s.getEnabled() != null && s.getEnabled(),
                "tone", s.getTone() != null ? s.getTone() : "FRIENDLY",
                "minRating", s.getMinRating() != null ? s.getMinRating() : 1,
                "maxRating", s.getMaxRating() != null ? s.getMaxRating() : 5,
                "delayMinutes", s.getDelayMinutes() != null ? s.getDelayMinutes() : 30
        ));
    }

    @PutMapping("/locations/{locationId}/auto-reply-settings")
    public ResponseEntity<?> updateSettings(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        AutoReplySettings settings = location.getAutoReplySettings() != null
                ? location.getAutoReplySettings()
                : new AutoReplySettings();

        if (request.containsKey("enabled"))
            settings.setEnabled(Boolean.parseBoolean(request.get("enabled").toString()));
        if (request.containsKey("tone"))
            settings.setTone(request.get("tone").toString().toUpperCase());
        if (request.containsKey("minRating"))
            settings.setMinRating(Integer.parseInt(request.get("minRating").toString()));
        if (request.containsKey("maxRating"))
            settings.setMaxRating(Integer.parseInt(request.get("maxRating").toString()));
        if (request.containsKey("delayMinutes"))
            settings.setDelayMinutes(Integer.parseInt(request.get("delayMinutes").toString()));
        settings.setUpdatedAt(LocalDateTime.now());

        location.setAutoReplySettings(settings);
        location.setUpdatedAt(LocalDateTime.now());
        locationRepository.save(location);

        return ResponseEntity.ok(Map.of("message", "Auto-reply settings saved successfully"));
    }
}
