package com.gmb.manager.controller;

import com.gmb.manager.entity.*;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.GmbService;
import com.gmb.manager.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final GmbService gmbService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/reviews")
    public ResponseEntity<?> getReviews(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestParam(required = false) List<Integer> ratings,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        PageRequest pageable = PageRequest.of(page, size, Sort.by("googleCreatedTime").descending());
        Page<Review> reviews = reviewService.getReviews(locationId, ratings, pageable);

        List<Map<String, Object>> responseList = reviews.getContent().stream().map(review -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", review.getId());
            map.put("reviewerName", review.getReviewerName());
            map.put("reviewerProfilePhoto", review.getReviewerProfilePhoto());
            map.put("rating", review.getRating());
            map.put("comment", review.getComment());
            map.put("status", review.getStatus());
            map.put("googleCreatedTime", review.getGoogleCreatedTime());
            map.put("createdAt", review.getCreatedAt());
            ReviewReply reply = reviewService.getReplyForReview(review.getId()).orElse(null);
            map.put("reply", reply);
            return map;
        }).toList();

        Map<String, Object> pageData = new HashMap<>();
        pageData.put("content", responseList);
        pageData.put("totalPages", reviews.getTotalPages());
        pageData.put("totalElements", reviews.getTotalElements());
        pageData.put("number", reviews.getNumber());
        pageData.put("size", reviews.getSize());

        return ResponseEntity.ok(pageData);
    }

    @PostMapping("/reviews/sync")
    public ResponseEntity<?> syncReviews(
            @AuthenticationPrincipal User user,
            @RequestParam String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        gmbService.syncReviews(locationId);
        return ResponseEntity.ok("Reviews synced successfully");
    }

    @PostMapping("/reviews/{reviewId}/reply/generate")
    public ResponseEntity<?> generateReply(
            @AuthenticationPrincipal User user,
            @PathVariable String reviewId,
            @RequestBody Map<String, String> request
    ) {
        String tone = request.getOrDefault("tone", "professional");
        try {
            ReviewReply reply = reviewService.generateAiReply(reviewId, tone);
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reviews/replies/{replyId}/publish")
    public ResponseEntity<?> publishReply(
            @AuthenticationPrincipal User user,
            @PathVariable String replyId
    ) {
        try {
            ReviewReply reply = reviewService.publishReply(replyId);
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reviews/replies/save")
    public ResponseEntity<?> saveReply(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request
    ) {
        String reviewId = request.get("reviewId");
        String replyText = request.get("replyText");
        String tone = request.getOrDefault("tone", "friendly");

        if (reviewId == null || replyText == null) {
            return ResponseEntity.badRequest().body("Missing reviewId or replyText");
        }

        try {
            ReviewReply reply = reviewService.saveReplyDraft(reviewId, replyText, tone);
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
