package com.gmb.manager.service;

import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Sends an email alert when a new low-star review is received.
     */
    public void sendNewReviewAlert(Review review, Location location) {
        if (!Boolean.TRUE.equals(location.getNotifyEnabled())) return;
        String recipientEmail = location.getNotifyEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) return;

        int threshold = location.getNotifyOnRatingBelow() != null ? location.getNotifyOnRatingBelow() : 3;
        if (review.getRating() >= threshold) return; // Only notify for low-star reviews

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(String.format("⚠️ New %d★ Review for %s", review.getRating(), location.getName()));
            message.setText(buildEmailBody(review, location));
            mailSender.send(message);
            log.info("Sent review alert email to {} for location {}", recipientEmail, location.getName());
        } catch (Exception e) {
            log.error("Failed to send review alert email: {}", e.getMessage());
        }
    }

    private String buildEmailBody(Review review, Location location) {
        String stars = "★".repeat(review.getRating()) + "☆".repeat(5 - review.getRating());
        return String.format(
            "GMB AI Manager — New Review Alert\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "📍 Business: %s\n" +
            "👤 Reviewer: %s\n" +
            "⭐ Rating: %s (%d/5)\n\n" +
            "💬 Review:\n\"%s\"\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "👉 Reply now at: %s/dashboard/reviews\n\n" +
            "This alert was sent by GMB AI Manager.",
            location.getName(),
            review.getReviewerName(),
            stars,
            review.getRating(),
            review.getComment() != null ? review.getComment() : "(No comment)",
            frontendUrl
        );
    }
}
