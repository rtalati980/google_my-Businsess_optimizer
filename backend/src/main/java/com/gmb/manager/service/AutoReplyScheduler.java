package com.gmb.manager.service;

import com.gmb.manager.entity.*;
import com.gmb.manager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoReplyScheduler {

    private final LocationRepository locationRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    private final GmbService gmbService;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    /**
     * Runs every 30 minutes — finds unanswered reviews and auto-replies
     * based on each location's embedded auto-reply settings.
     */
    @Scheduled(fixedDelayString = "PT30M")
    public void processAutoReplies() {
        List<Location> activeLocations = locationRepository.findAll().stream()
                .filter(loc -> loc.getAutoReplySettings() != null
                        && Boolean.TRUE.equals(loc.getAutoReplySettings().getEnabled()))
                .toList();

        if (activeLocations.isEmpty()) return;

        log.info("Auto-reply scheduler: processing {} active location(s)", activeLocations.size());

        for (Location location : activeLocations) {
            try {
                processLocationAutoReply(location);
            } catch (Exception e) {
                log.error("Auto-reply failed for location {}: {}", location.getName(), e.getMessage());
            }
        }
    }

    private void processLocationAutoReply(Location location) {
        AutoReplySettings settings = location.getAutoReplySettings();

        Business business = businessRepository.findById(location.getBusinessId()).orElse(null);
        if (business == null) return;

        User user = userRepository.findById(business.getUserId()).orElse(null);
        if (user == null) return;

        String token = gmbService.ensureFreshToken(user);
        if (token == null) {
            log.warn("Auto-reply skipped for {} — no Google token", location.getName());
            return;
        }

        // Sync latest reviews first
        gmbService.syncReviews(location.getId());

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(settings.getDelayMinutes());
        List<Review> unanswered = reviewRepository.findByLocationId(location.getId())
                .stream()
                .filter(r -> "UNANSWERED".equals(r.getStatus()))
                .filter(r -> r.getRating() >= settings.getMinRating()
                          && r.getRating() <= settings.getMaxRating())
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isBefore(cutoff))
                .toList();

        if (unanswered.isEmpty()) {
            log.debug("Auto-reply: no eligible reviews for location {}", location.getName());
            return;
        }

        log.info("Auto-reply: generating replies for {} review(s) at {}", unanswered.size(), location.getName());

        for (Review review : unanswered) {
            try {
                ReviewReply reply = reviewService.generateAiReply(review.getId(), settings.getTone());
                reviewService.publishReply(reply.getId());
                log.info("Auto-replied to review by {} at {}", review.getReviewerName(), location.getName());
            } catch (Exception e) {
                log.error("Failed to auto-reply to review {}: {}", review.getId(), e.getMessage());
            }
        }
    }
}
