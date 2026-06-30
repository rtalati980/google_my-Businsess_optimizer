package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
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
public class NotificationController {

    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/notification-settings")
    public ResponseEntity<?> getNotificationSettings(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        return ResponseEntity.ok(Map.of(
                "notifyEnabled", location.getNotifyEnabled() != null && location.getNotifyEnabled(),
                "notifyEmail", location.getNotifyEmail() != null ? location.getNotifyEmail() : "",
                "notifyOnRatingBelow", location.getNotifyOnRatingBelow() != null ? location.getNotifyOnRatingBelow() : 3
        ));
    }

    @PutMapping("/locations/{locationId}/notification-settings")
    public ResponseEntity<?> updateNotificationSettings(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        if (request.containsKey("notifyEnabled")) {
            location.setNotifyEnabled(Boolean.parseBoolean(request.get("notifyEnabled").toString()));
        }
        if (request.containsKey("notifyEmail")) {
            location.setNotifyEmail((String) request.get("notifyEmail"));
        }
        if (request.containsKey("notifyOnRatingBelow")) {
            location.setNotifyOnRatingBelow(Integer.parseInt(request.get("notifyOnRatingBelow").toString()));
        }
        location.setUpdatedAt(LocalDateTime.now());

        locationRepository.save(location);
        return ResponseEntity.ok(Map.of("message", "Notification settings saved successfully"));
    }
}
