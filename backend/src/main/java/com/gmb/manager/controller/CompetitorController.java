package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Competitor;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.CompetitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompetitorController {

    private final CompetitorService competitorService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/competitors")
    public ResponseEntity<?> getCompetitors(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        List<Competitor> competitors = competitorService.getCompetitorsByLocation(locationId);
        return ResponseEntity.ok(competitors);
    }

    @PostMapping("/locations/{locationId}/competitors")
    public ResponseEntity<?> addCompetitor(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String name = request.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Competitor name cannot be empty");
        }

        try {
            Competitor competitor = competitorService.addCompetitor(locationId, name);
            return ResponseEntity.ok(competitor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/competitors/{competitorId}")
    public ResponseEntity<?> removeCompetitor(
            @AuthenticationPrincipal User user,
            @PathVariable String competitorId
    ) {
        try {
            competitorService.removeCompetitor(competitorId);
            return ResponseEntity.ok("Competitor removed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
