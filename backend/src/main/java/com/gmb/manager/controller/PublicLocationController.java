package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Review;
import com.gmb.manager.entity.ReviewReply;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.ReviewRepository;
import com.gmb.manager.repository.ReviewReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicLocationController {

    private final LocationRepository locationRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;

    /**
     * Public endpoint – no authentication required.
     * Returns store details, reviews and published replies for the public landing page.
     */
    @GetMapping("/locations/{locationId}")
    public ResponseEntity<Map<String, Object>> getPublicLocation(@PathVariable String locationId) {
        Optional<Location> locOpt = locationRepository.findById(locationId);
        if (locOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Location loc = locOpt.get();
        List<Review> reviews = reviewRepository.findByLocationId(locationId);

        List<Map<String, Object>> publicReviews = new ArrayList<>();
        for (Review r : reviews) {
            Map<String, Object> reviewMap = new LinkedHashMap<>();
            reviewMap.put("id", r.getId());
            reviewMap.put("reviewerName", r.getReviewerName());
            reviewMap.put("reviewerProfilePhoto", r.getReviewerProfilePhoto());
            reviewMap.put("rating", r.getRating());
            reviewMap.put("comment", r.getComment());
            reviewMap.put("date", r.getGoogleCreatedTime());

            reviewReplyRepository.findByReviewId(r.getId())
                    .filter(reply -> Boolean.TRUE.equals(reply.getIsPublished()))
                    .ifPresent(reply -> reviewMap.put("ownerReply", reply.getReplyText()));

            publicReviews.add(reviewMap);
        }

        OptionalDouble avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", loc.getId());
        response.put("name", loc.getName());
        response.put("category", loc.getCategory());
        response.put("address", loc.getAddress());
        response.put("phone", loc.getPhone());
        response.put("website", loc.getWebsite());
        response.put("latitude", loc.getLatitude());
        response.put("longitude", loc.getLongitude());
        response.put("averageRating", avgRating.isPresent() ? Math.round(avgRating.getAsDouble() * 10.0) / 10.0 : 0.0);
        response.put("totalReviews", reviews.size());
        response.put("reviews", publicReviews);

        return ResponseEntity.ok(response);
    }
}
