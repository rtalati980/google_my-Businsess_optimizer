package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Post;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.PlanGateService;
import com.gmb.manager.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;
    private final PlanGateService planGateService;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/locations/{locationId}/posts")
    public ResponseEntity<?> getPosts(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        List<Post> posts = postService.getPostsByLocation(locationId);
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/locations/{locationId}/posts/generate")
    public ResponseEntity<?> generatePost(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwner(location, user)) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        try {
            String postType = request.getOrDefault("postType", "WEEKLY").toString();
            String topic = request.containsKey("topic") && request.get("topic") != null ?
                request.get("topic").toString() : null;
            String customPrompt = request.containsKey("customPrompt") && request.get("customPrompt") != null ?
                request.get("customPrompt").toString() : null;
            boolean includeImage = request.containsKey("includeImage") &&
                Boolean.parseBoolean(request.get("includeImage").toString());

            Post post = postService.generatePost(locationId, postType, topic, includeImage, customPrompt);
            return ResponseEntity.ok(post);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error generating post: " + e.getMessage()));
        }
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<?> updatePost(
            @AuthenticationPrincipal User user,
            @PathVariable String postId,
            @RequestBody Map<String, String> request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        String content = request.get("content");
        String mediaUrl = request.get("mediaUrl");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Content cannot be empty"));
        }

        try {
            Post post = postService.updatePost(postId, content, mediaUrl);

            // Verify ownership
            Location location = locationRepository.findById(post.getLocationId()).orElse(null);
            if (location == null || !isOwner(location, user)) {
                return ResponseEntity.status(403).body("Access Denied");
            }

            return ResponseEntity.ok(post);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error updating post: " + e.getMessage()));
        }
    }

    @PostMapping("/posts/{postId}/publish")
    public ResponseEntity<?> publishPost(
            @AuthenticationPrincipal User user,
            @PathVariable String postId
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        try {
            // ── Plan gate: only paid plans can push directly to Google ──────
            planGateService.requirePublishPermission(user.getId());

            Post post = postService.publishPost(postId);

            // Verify ownership
            Location location = locationRepository.findById(post.getLocationId()).orElse(null);
            if (location == null || !isOwner(location, user)) {
                return ResponseEntity.status(403).body("Access Denied");
            }

            return ResponseEntity.ok(post);
        } catch (org.springframework.web.server.ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("message", rse.getReason()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error publishing post: " + e.getMessage()));
        }
    }

    @PostMapping("/locations/{locationId}/posts/generate-optimized")
    public ResponseEntity<?> generateOptimizedPost(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, Object> request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwner(location, user)) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        try {
            String postType = request.getOrDefault("postType", "WEEKLY").toString();
            String topic = request.containsKey("topic") && request.get("topic") != null ?
                request.get("topic").toString() : null;
            boolean includeImage = request.containsKey("includeImage") &&
                Boolean.parseBoolean(request.get("includeImage").toString());

            Map<String, Object> result = postService.generateOptimizedPost(locationId, postType, topic, includeImage);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error generating optimized post: " + e.getMessage()));
        }
    }

    @GetMapping("/posts/{postId}/seo-metrics")
    public ResponseEntity<?> getSeoMetrics(
            @AuthenticationPrincipal User user,
            @PathVariable String postId
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required");
        }

        try {
            return ResponseEntity.ok(postService.getSeoMetrics(postId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error retrieving SEO metrics: " + e.getMessage()));
        }
    }
}
