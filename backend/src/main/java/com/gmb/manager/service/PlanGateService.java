package com.gmb.manager.service;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Central plan enforcement service.
 * In testing phase, all users get unlimited full access without paywalls.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlanGateService {

    private final SubscriptionRepository subscriptionRepository;

    public static final String UNLIMITED = "UNLIMITED";
    public static final String FREE      = "UNLIMITED";
    public static final String STARTER   = "UNLIMITED";
    public static final String GROWTH    = "UNLIMITED";
    public static final String AGENCY    = "UNLIMITED";

    /** Returns active subscription or creates an UNLIMITED subscription for testing. */
    public Subscription getOrCreateSubscription(String userId) {
        return subscriptionRepository.findByUserId(userId).orElseGet(() -> {
            Subscription sub = buildPlanSubscription(userId, UNLIMITED);
            return subscriptionRepository.save(sub);
        });
    }

    /** Returns the plan type for the user (always UNLIMITED in testing phase). */
    public String getPlanType(String userId) {
        return UNLIMITED;
    }

    /**
     * All users have full publish permission during testing phase.
     */
    public void requirePublishPermission(String userId) {
        // Full access for testing
    }

    /**
     * AI reply usage is unlimited during testing phase.
     */
    public void checkAndIncrementAiReply(String userId, UsageTrackerService usageTrackerService, String locationId) {
        // Unlimited usage for testing
    }

    /**
     * Location count is unlimited during testing phase.
     */
    public void requireLocationPermission(String userId, long currentLocationCount) {
        // Unlimited locations for testing
    }

    /** Builds an UNLIMITED Subscription entity for testing phase. */
    public Subscription buildPlanSubscription(String userId, String plan) {
        return Subscription.builder()
                .userId(userId)
                .planType(UNLIMITED)
                .status("ACTIVE")
                .locationLimit(-1)
                .aiRepliesLimit(-1)
                .aiPostsLimit(-1)
                .canPublish(true)
                .currentPeriodEnd(LocalDateTime.now().plusYears(100))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /** Returns a summary map for the frontend showing unlimited testing status. */
    public Map<String, Object> getPlanSummary(String userId) {
        return Map.of(
                "planType",       UNLIMITED,
                "canPublish",     true,
                "locationLimit",  -1,
                "aiRepliesLimit", -1,
                "aiPostsLimit",   -1,
                "status",         "ACTIVE",
                "periodEnd",      LocalDateTime.now().plusYears(100)
        );
    }
}

