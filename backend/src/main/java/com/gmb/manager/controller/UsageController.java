package com.gmb.manager.controller;

import com.gmb.manager.entity.User;
import com.gmb.manager.service.UsageTrackerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UsageController {

    private final UsageTrackerService usageTrackerService;

    @GetMapping("/usage")
    public ResponseEntity<?> getUserUsage(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(usageTrackerService.getUserUsage(user.getId()));
    }

    @PostMapping("/usage/reset-monthly")
    public ResponseEntity<?> resetMonthlyQuotas(
            @AuthenticationPrincipal User user
    ) {
        usageTrackerService.resetMonthlyQuotas(user.getId());
        return ResponseEntity.ok("Monthly quotas reset");
    }
}
