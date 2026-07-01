package com.gmb.manager.controller;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.SubscriptionRepository;
import com.gmb.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getSubscription(@AuthenticationPrincipal User userParam) {
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElse(null);
        if (subscription == null) {
            subscription = Subscription.builder()
                    .userId(user.getId())
                    .planType("PREMIUM")
                    .status("TRIALING")
                    .currentPeriodEnd(LocalDateTime.now().plusDays(14))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            subscription = subscriptionRepository.save(subscription);
        }
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> simulateCheckout(
            @AuthenticationPrincipal User userParam,
            @RequestBody Map<String, String> request
    ) {
        String planType = request.get("planType");
        if (planType == null) {
            return ResponseEntity.badRequest().body("Plan type is required");
        }

        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElse(null);

        if (subscription == null) {
            subscription = Subscription.builder()
                    .userId(user.getId())
                    .planType(planType.toUpperCase())
                    .status("ACTIVE")
                    .stripeSubscriptionId("sub_sim_" + UUID.randomUUID().toString().substring(0, 8))
                    .stripeCustomerId("cus_sim_" + UUID.randomUUID().toString().substring(0, 8))
                    .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        } else {
            subscription.setPlanType(planType.toUpperCase());
            subscription.setStatus("ACTIVE");
            subscription.setCurrentPeriodEnd(LocalDateTime.now().plusDays(30));
            subscription.setUpdatedAt(LocalDateTime.now());
        }

        Subscription saved = subscriptionRepository.save(subscription);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/simulate-expiry")
    public ResponseEntity<?> simulateExpiry(@AuthenticationPrincipal User user) {
        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        subscription.setStatus("TRIALING");
        subscription.setCurrentPeriodEnd(LocalDateTime.now().minusDays(1));
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
        return ResponseEntity.ok(subscription);
    }
}
