package com.gmb.manager.service;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.entity.UsageTracker;
import com.gmb.manager.repository.SubscriptionRepository;
import com.gmb.manager.repository.UsageTrackerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsageTrackerService {

    private final UsageTrackerRepository usageTrackerRepository;
    private final SubscriptionRepository subscriptionRepository;

    private static final Map<String, Map<String, Integer>> PLAN_LIMITS = new HashMap<>();

    static {
        // FREE plan limits
        Map<String, Integer> freeLimits = new HashMap<>();
        freeLimits.put("reviewRequests",     5);
        freeLimits.put("optimizedPosts",     5);
        freeLimits.put("customerProfiles",   10);
        freeLimits.put("analyticsReports",   1);
        freeLimits.put("aiReplySuggestions", 10);
        PLAN_LIMITS.put("FREE", freeLimits);

        // STARTER plan limits
        Map<String, Integer> starterLimits = new HashMap<>();
        starterLimits.put("reviewRequests",     50);
        starterLimits.put("optimizedPosts",     Integer.MAX_VALUE);
        starterLimits.put("customerProfiles",   Integer.MAX_VALUE);
        starterLimits.put("analyticsReports",   3);
        starterLimits.put("aiReplySuggestions", 50);
        PLAN_LIMITS.put("STARTER", starterLimits);

        // GROWTH plan limits
        Map<String, Integer> growthLimits = new HashMap<>();
        growthLimits.put("reviewRequests",     200);
        growthLimits.put("optimizedPosts",     Integer.MAX_VALUE);
        growthLimits.put("customerProfiles",   Integer.MAX_VALUE);
        growthLimits.put("analyticsReports",   Integer.MAX_VALUE);
        growthLimits.put("aiReplySuggestions", 200);
        PLAN_LIMITS.put("GROWTH", growthLimits);

        // AGENCY plan limits (unlimited everything)
        Map<String, Integer> agencyLimits = new HashMap<>();
        agencyLimits.put("reviewRequests",     Integer.MAX_VALUE);
        agencyLimits.put("optimizedPosts",     Integer.MAX_VALUE);
        agencyLimits.put("customerProfiles",   Integer.MAX_VALUE);
        agencyLimits.put("analyticsReports",   Integer.MAX_VALUE);
        agencyLimits.put("aiReplySuggestions", Integer.MAX_VALUE);
        PLAN_LIMITS.put("AGENCY", agencyLimits);

        // Legacy aliases
        PLAN_LIMITS.put("BASIC",    freeLimits);
        PLAN_LIMITS.put("PREMIUM",  growthLimits);
    }

    public UsageTracker getOrCreateUsageTracker(String userId, String locationId, String planType) {
        Optional<UsageTracker> existing = usageTrackerRepository.findByUserIdAndLocationId(userId, locationId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Map<String, Integer> limits = PLAN_LIMITS.getOrDefault(planType, PLAN_LIMITS.get("BASIC"));

        LocalDateTime now = LocalDateTime.now();
        UsageTracker tracker = UsageTracker.builder()
                .userId(userId)
                .locationId(locationId)
                .planType(planType)
                .reviewRequestsUsed(0)
                .reviewRequestsLimit(limits.get("reviewRequests"))
                .optimizedPostsUsed(0)
                .optimizedPostsLimit(limits.get("optimizedPosts"))
                .customerProfilesUsed(0)
                .customerProfilesLimit(limits.get("customerProfiles"))
                .analyticsReportsUsed(0)
                .analyticsReportsLimit(limits.get("analyticsReports"))
                .aiReplySuggestionsUsed(0)
                .aiReplySuggestionsLimit(limits.get("aiReplySuggestions"))
                .billingPeriodStart(now)
                .billingPeriodEnd(now.plusMonths(1))
                .createdAt(now)
                .updatedAt(now)
                .build();

        return usageTrackerRepository.save(tracker);
    }

    public void checkAndIncrementReviewRequests(String userId, String locationId) {
        String plan = subscriptionRepository.findByUserId(userId)
                .map(s -> s.getPlanType() != null ? s.getPlanType() : "FREE").orElse("FREE");
        UsageTracker tracker = getOrCreateUsageTracker(userId, locationId, plan);

        if (tracker.getReviewRequestsUsed() >= tracker.getReviewRequestsLimit()) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "Review request quota exceeded. Upgrade your plan.");
        }

        tracker.setReviewRequestsUsed(tracker.getReviewRequestsUsed() + 1);
        tracker.setUpdatedAt(LocalDateTime.now());
        usageTrackerRepository.save(tracker);

        log.info("Review request quota updated for user {} location {}: {}/{}",
                userId, locationId, tracker.getReviewRequestsUsed(), tracker.getReviewRequestsLimit());
    }

    public void checkAndIncrementOptimizedPosts(String userId, String locationId) {
        String plan = subscriptionRepository.findByUserId(userId)
                .map(s -> s.getPlanType() != null ? s.getPlanType() : "FREE").orElse("FREE");
        UsageTracker tracker = getOrCreateUsageTracker(userId, locationId, plan);

        if (tracker.getOptimizedPostsUsed() >= tracker.getOptimizedPostsLimit()) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "UPGRADE_REQUIRED|AI post generation limit reached. Upgrade your plan.");
        }

        tracker.setOptimizedPostsUsed(tracker.getOptimizedPostsUsed() + 1);
        tracker.setUpdatedAt(LocalDateTime.now());
        usageTrackerRepository.save(tracker);

        log.info("Optimized posts quota updated for user {} location {}: {}/{}",
                userId, locationId, tracker.getOptimizedPostsUsed(), tracker.getOptimizedPostsLimit());
    }

    public void checkAndIncrementAnalyticsReports(String userId, String locationId) {
        UsageTracker tracker = getOrCreateUsageTracker(userId, locationId, "PREMIUM");

        if (tracker.getAnalyticsReportsUsed() >= tracker.getAnalyticsReportsLimit()) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "Analytics reports quota exceeded. Upgrade your plan.");
        }

        tracker.setAnalyticsReportsUsed(tracker.getAnalyticsReportsUsed() + 1);
        tracker.setUpdatedAt(LocalDateTime.now());
        usageTrackerRepository.save(tracker);

        log.info("Analytics reports quota updated for user {} location {}: {}/{}",
                userId, locationId, tracker.getAnalyticsReportsUsed(), tracker.getAnalyticsReportsLimit());
    }

    /** Called from PlanGateService with already-resolved plan type. */
    public void checkAndIncrementAiReplySuggestions(String userId, String locationId, String plan) {
        UsageTracker tracker = getOrCreateUsageTracker(userId, locationId, plan);

        if (tracker.getAiReplySuggestionsUsed() >= tracker.getAiReplySuggestionsLimit()) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "UPGRADE_REQUIRED|You've used all " + tracker.getAiReplySuggestionsLimit() +
                    " AI reply suggestions this month. Upgrade for more.");
        }

        tracker.setAiReplySuggestionsUsed(tracker.getAiReplySuggestionsUsed() + 1);
        tracker.setUpdatedAt(LocalDateTime.now());
        usageTrackerRepository.save(tracker);

        log.info("AI reply suggestions quota updated for user {} location {} plan {}: {}/{}",
                userId, locationId, plan, tracker.getAiReplySuggestionsUsed(), tracker.getAiReplySuggestionsLimit());
    }

    /** Convenience overload — looks up plan from subscription. */
    public void checkAndIncrementAiReplySuggestions(String userId, String locationId) {
        String plan = subscriptionRepository.findByUserId(userId)
                .map(s -> s.getPlanType() != null ? s.getPlanType() : "FREE").orElse("FREE");
        checkAndIncrementAiReplySuggestions(userId, locationId, plan);
    }

    public Map<String, Object> getUserUsage(String userId) {
        Optional<UsageTracker> tracker = usageTrackerRepository.findByUserId(userId);
        if (tracker.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usage tracker not found");
        }

        UsageTracker t = tracker.get();
        Map<String, Object> usage = new HashMap<>();
        usage.put("planType", t.getPlanType());
        usage.put("reviewRequests", Map.of(
                "used", t.getReviewRequestsUsed(),
                "limit", t.getReviewRequestsLimit(),
                "percentage", t.getReviewRequestsLimit() > 0 ? (t.getReviewRequestsUsed() * 100 / t.getReviewRequestsLimit()) : 0
        ));
        usage.put("optimizedPosts", Map.of(
                "used", t.getOptimizedPostsUsed(),
                "limit", t.getOptimizedPostsLimit(),
                "percentage", t.getOptimizedPostsLimit() > 0 ? (t.getOptimizedPostsUsed() * 100 / t.getOptimizedPostsLimit()) : 0
        ));
        usage.put("customerProfiles", Map.of(
                "used", t.getCustomerProfilesUsed(),
                "limit", t.getCustomerProfilesLimit(),
                "percentage", t.getCustomerProfilesLimit() > 0 ? (t.getCustomerProfilesUsed() * 100 / t.getCustomerProfilesLimit()) : 0
        ));
        usage.put("analyticsReports", Map.of(
                "used", t.getAnalyticsReportsUsed(),
                "limit", t.getAnalyticsReportsLimit(),
                "percentage", t.getAnalyticsReportsLimit() > 0 ? (t.getAnalyticsReportsUsed() * 100 / t.getAnalyticsReportsLimit()) : 0
        ));
        usage.put("aiReplySuggestions", Map.of(
                "used", t.getAiReplySuggestionsUsed(),
                "limit", t.getAiReplySuggestionsLimit(),
                "percentage", t.getAiReplySuggestionsLimit() > 0 ? (t.getAiReplySuggestionsUsed() * 100 / t.getAiReplySuggestionsLimit()) : 0
        ));
        usage.put("billingPeriodStart", t.getBillingPeriodStart());
        usage.put("billingPeriodEnd", t.getBillingPeriodEnd());

        return usage;
    }

    public void resetMonthlyQuotas(String userId) {
        Optional<UsageTracker> tracker = usageTrackerRepository.findByUserId(userId);
        if (tracker.isPresent()) {
            UsageTracker t = tracker.get();
            t.setReviewRequestsUsed(0);
            t.setOptimizedPostsUsed(0);
            t.setAnalyticsReportsUsed(0);
            t.setAiReplySuggestionsUsed(0);
            t.setBillingPeriodStart(LocalDateTime.now());
            t.setBillingPeriodEnd(LocalDateTime.now().plusMonths(1));
            t.setUpdatedAt(LocalDateTime.now());
            usageTrackerRepository.save(t);

            log.info("Monthly quotas reset for user {}", userId);
        }
    }
}
