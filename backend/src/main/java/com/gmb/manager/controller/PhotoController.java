package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Photo;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.PhotoService;
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
@RequestMapping("/api/locations/{locationId}/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String title = request.get("title");
        String description = request.get("description");
        String imageUrl = request.get("imageUrl");
        String category = request.getOrDefault("category", "OTHER");

        if (title == null || imageUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and image URL required"));
        }

        Photo photo = photoService.uploadPhoto(locationId, title, description, imageUrl, category, user.getEmail());
        return ResponseEntity.ok(photo);
    }

    @GetMapping
    public ResponseEntity<?> getPhotos(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        Page<Photo> photos = photoService.getLocationPhotosPage(locationId, pageable);
        return ResponseEntity.ok(photos);
    }

    @GetMapping("/{photoId}")
    public ResponseEntity<?> getPhoto(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String photoId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Photo photo = photoService.getPhoto(photoId);
        return ResponseEntity.ok(photo);
    }

    @PutMapping("/{photoId}")
    public ResponseEntity<?> updatePhoto(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String photoId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String title = request.get("title");
        String description = request.get("description");
        String category = request.get("category");

        Photo updated = photoService.updatePhoto(photoId, title, description, category);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{photoId}/publish")
    public ResponseEntity<?> publishPhoto(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String photoId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Photo published = photoService.publishPhoto(photoId);
        return ResponseEntity.ok(published);
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<?> deletePhoto(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String photoId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        photoService.deletePhoto(photoId);
        return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
    }

    @GetMapping("/{photoId}/analytics")
    public ResponseEntity<?> getPhotoAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String photoId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analytics = photoService.getPhotoAnalytics(photoId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<?> getLocationPhotoAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analytics = photoService.getLocationPhotoAnalytics(locationId);
        return ResponseEntity.ok(analytics);
    }
}
