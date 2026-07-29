package com.gmb.manager.service;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Central plan enforcement service.
 * All feature gates go through here — keeping access control in one place.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlanGateService {

    private final SubscriptionRepository subscriptionRepository;

    // ── Plan definitions ────────────────────────────────────────────────────
    public static final String FREE    = "FREE";
    public static final String STARTER = "STARTER";
    public static final String GROWTH  = "GROWTH";
    public static final String AGENCY  = "AGENCY";

    /** Returns active subscription or creates a default FREE subscription. */
    public Subscription getOrCreateSubscription(String userId) {
        return subscriptionRepository.findByUserId(userId).orElseGet(() -> {
            Subscription free = buildPlanSubscription(userId, FREE);
            return subscriptionRepository.save(free);
        });
    }

    /** Returns the plan type for the user (FREE if not found). */
    public String getPlanType(String userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(Subscription::getPlanType)
                .orElse(FREE);
    }

    /**
     * Checks whether the user's plan allows direct publishing to Google.
     * FREE plan: generate only — no publish.
     * STARTER/GROWTH/AGENCY: full publish.
     */
    public void requirePublishPermission(String userId) {
        Subscription sub = getOrCreateSubscription(userId);
        boolean canPublish = Boolean.TRUE.equals(sub.getCanPublish());
        if (!canPublish) {
            log.info("User {} on FREE plan attempted publish — blocked", userId);
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "UPGRADE_REQUIRED|Publishing directly to Google requires a paid plan. " +
                    "Upgrade to Starter (₹499/mo) at /settings/billing");
        }
    }

    /**
     * Checks and increments AI reply usage.
     * Blocks when the monthly limit is reached.
     */
    public void checkAndIncrementAiReply(String userId, UsageTrackerService usageTrackerService, String locationId) {
        Subscription sub = getOrCreateSubscription(userId);
        String plan = sub.getPlanType() != null ? sub.getPlanType() : FREE;

        // Unlimited for AGENCY
        if (AGENCY.equalsIgnoreCase(plan)) return;

        // Delegate to usage tracker for per-location counting
        usageTrackerService.checkAndIncrementAiReplySuggestions(userId, locationId, plan);
    }

    /**
     * Checks whether the user can add another location.
     * FREE: 1, STARTER: 1, GROWTH: 3, AGENCY: unlimited
     */
    public void requireLocationPermission(String userId, long currentLocationCount) {
        Subscription sub = getOrCreateSubscription(userId);
        int limit = sub.getLocationLimit() != null ? sub.getLocationLimit() : 1;
        if (limit != -1 && currentLocationCount >= limit) {
            String upgradeMsg = STARTER.equalsIgnoreCase(sub.getPlanType())
                    ? "Upgrade to Growth (₹1,499/mo) to manage up to 3 locations."
                    : "Upgrade to Agency (₹3,999/mo) for unlimited locations.";
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "UPGRADE_REQUIRED|Location limit reached. " + upgradeMsg);
        }
    }

    /** Builds a Subscription entity for a given plan with correct limits. */
    public Subscription buildPlanSubscription(String userId, String plan) {
        return switch (plan.toUpperCase()) {
            case STARTER -> Subscription.builder()
                    .userId(userId).planType(STARTER).status("ACTIVE")
                    .locationLimit(1).aiRepliesLimit(50).aiPostsLimit(-1).canPublish(true)
                    .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                    .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
            case GROWTH -> Subscription.builder()
                    .userId(userId).planType(GROWTH).status("ACTIVE")
                    .locationLimit(3).aiRepliesLimit(200).aiPostsLimit(-1).canPublish(true)
                    .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                    .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
            case AGENCY -> Subscription.builder()
                    .userId(userId).planType(AGENCY).status("ACTIVE")
                    .locationLimit(-1).aiRepliesLimit(-1).aiPostsLimit(-1).canPublish(true)
                    .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                    .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
            default -> Subscription.builder() // FREE
                    .userId(userId).planType(FREE).status("ACTIVE")
                    .locationLimit(1).aiRepliesLimit(10).aiPostsLimit(5).canPublish(false)
                    .currentPeriodEnd(LocalDateTime.now().plusDays(36500)) // free = no expiry
                    .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        };
    }

    /** Returns a summary map for the frontend plan badge + usage UI. */
    public Map<String, Object> getPlanSummary(String userId) {
        Subscription sub = getOrCreateSubscription(userId);
        String plan = sub.getPlanType() != null ? sub.getPlanType() : FREE;
        return Map.of(
                "planType",       plan,
                "canPublish",     Boolean.TRUE.equals(sub.getCanPublish()),
                "locationLimit",  sub.getLocationLimit() != null ? sub.getLocationLimit() : 1,
                "aiRepliesLimit", sub.getAiRepliesLimit() != null ? sub.getAiRepliesLimit() : 10,
                "aiPostsLimit",   sub.getAiPostsLimit()   != null ? sub.getAiPostsLimit()   : 5,
                "status",         sub.getStatus() != null ? sub.getStatus() : "ACTIVE",
                "periodEnd",      sub.getCurrentPeriodEnd()
        );
    }
}
