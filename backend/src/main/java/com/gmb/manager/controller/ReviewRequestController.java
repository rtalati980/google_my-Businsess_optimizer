package com.gmb.manager.controller;

import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.ReviewRequest;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.ReviewRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewRequestController {

    private final ReviewRequestService reviewRequestService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        return businessRepository.findById(location.getBusinessId())
                .map(business -> business.getUserId().equals(user.getId()))
                .orElse(false);
    }

    @PostMapping("/locations/{locationId}/review-requests/generate")
    public ResponseEntity<?> generateReviewRequests(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        @SuppressWarnings("unchecked")
        List<Map<String, String>> customers = (List<Map<String, String>>) request.get("customers");
        String requestType = (String) request.get("requestType");

        if (customers == null || customers.isEmpty()) {
            return ResponseEntity.badRequest().body("Customers list is required");
        }
        if (requestType == null || requestType.isEmpty()) {
            return ResponseEntity.badRequest().body("Request type is required");
        }

        List<ReviewRequest> generated = reviewRequestService.generateReviewRequests(locationId, customers, requestType);
        return ResponseEntity.ok(Map.of(
                "message", "Generated " + generated.size() + " review requests",
                "requests", generated,
                "count", generated.size()
        ));
    }

    @PostMapping("/locations/{locationId}/review-requests/send")
    public ResponseEntity<?> sendReviewRequests(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        @SuppressWarnings("unchecked")
        List<String> requestIds = (List<String>) request.get("requestIds");

        if (requestIds == null || requestIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Request IDs are required");
        }

        List<ReviewRequest> sent = reviewRequestService.sendReviewRequests(locationId, requestIds);
        return ResponseEntity.ok(Map.of(
                "message", "Sent " + sent.size() + " review requests",
                "sentCount", sent.size()
        ));
    }

    @GetMapping("/locations/{locationId}/review-requests")
    public ResponseEntity<?> getReviewRequests(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        List<ReviewRequest> requests = reviewRequestService.getReviewRequests(locationId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/locations/{locationId}/review-requests/stats")
    public ResponseEntity<?> getReviewRequestStats(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> stats = reviewRequestService.getReviewRequestStats(locationId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/review-requests/{requestId}/complete")
    public ResponseEntity<?> markAsCompleted(
            @AuthenticationPrincipal User user,
            @PathVariable String requestId
    ) {
        reviewRequestService.markAsCompleted(requestId);
        return ResponseEntity.ok(Map.of("message", "Review request marked as completed"));
    }
}
