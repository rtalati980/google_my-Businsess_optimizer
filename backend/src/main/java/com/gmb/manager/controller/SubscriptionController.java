package com.gmb.manager.controller;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.UserRepository;
import com.gmb.manager.service.PlanGateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final UserRepository userRepository;
    private final PlanGateService planGateService;

    /** Returns the user's current subscription (always UNLIMITED in testing phase). */
    @GetMapping
    public ResponseEntity<?> getSubscription(@AuthenticationPrincipal User userParam) {
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Subscription subscription = planGateService.getOrCreateSubscription(user.getId());
        return ResponseEntity.ok(subscription);
    }

    /** Returns a concise plan summary for the frontend. */
    @GetMapping("/plan-summary")
    public ResponseEntity<?> getPlanSummary(@AuthenticationPrincipal User userParam) {
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(planGateService.getPlanSummary(user.getId()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> simulateCheckout(
            @AuthenticationPrincipal User userParam,
            @RequestBody Map<String, String> request
    ) {
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(planGateService.getOrCreateSubscription(user.getId()));
    }

    @PostMapping("/simulate-expiry")
    public ResponseEntity<?> simulateExpiry(@AuthenticationPrincipal User userParam) {
        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(planGateService.getOrCreateSubscription(user.getId()));
    }
}

