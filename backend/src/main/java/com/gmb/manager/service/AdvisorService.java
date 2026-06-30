package com.gmb.manager.service;

import com.gmb.manager.entity.*;
import com.gmb.manager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdvisorService {

    private final LocationRepository locationRepository;
    private final ReviewRepository reviewRepository;
    private final PostRepository postRepository;
    private final CompetitorRepository competitorRepository;
    private final AiService aiService;

    public String generateGrowthPlan(String locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        List<Review> reviews = reviewRepository.findByLocationId(locationId);
        List<Post> posts = postRepository.findByLocationId(locationId);
        List<Competitor> competitors = competitorRepository.findByLocationId(locationId);

        // Build review summary
        long totalReviews = reviews.size();
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        long unanswered = reviews.stream().filter(r -> "UNANSWERED".equals(r.getStatus())).count();
        long fiveStars = reviews.stream().filter(r -> r.getRating() == 5).count();
        long oneToTwo = reviews.stream().filter(r -> r.getRating() <= 2).count();

        StringBuilder reviewComments = new StringBuilder();
        reviews.stream().limit(10).forEach(r ->
                reviewComments.append(String.format("- %d★ by %s: \"%s\"\n",
                        r.getRating(), r.getReviewerName(),
                        r.getComment() != null ? r.getComment() : "No text")));

        // Build competitor summary
        StringBuilder competitorSummary = new StringBuilder();
        competitors.forEach(c ->
                competitorSummary.append(String.format("- %s: %.1f★, %d reviews, posting: %s\n",
                        c.getName(), c.getRating(), c.getReviewCount(), c.getPostingActivity())));

        // Build post history
        StringBuilder postHistory = new StringBuilder();
        posts.stream().limit(5).forEach(p ->
                postHistory.append(String.format("- [%s] %s: %s\n",
                        p.getPostType(), p.getTopic(),
                        p.getContent() != null ? p.getContent().substring(0, Math.min(80, p.getContent().length())) + "..." : "")));

        String system = """
                You are a senior local SEO consultant and Google Business Profile expert with 10+ years of experience
                helping Indian local businesses grow online. You deeply understand Indian consumer behaviour,
                Google's local ranking algorithm, and what drives foot traffic and conversions for small businesses.
                Give direct, actionable, prioritised advice. Be specific — name exact actions, timelines, and expected impact.
                Format your response in clean sections with clear headings.
                """;

        String prompt = String.format("""
                Analyse this local business and give a complete 30-day growth plan.

                BUSINESS DETAILS:
                Name: %s
                Category: %s
                Address: %s
                Website: %s
                Phone: %s

                REVIEW PERFORMANCE:
                Total Reviews: %d
                Average Rating: %.1f / 5.0
                Unanswered Reviews: %d (must reply within 24h for SEO boost)
                5-Star Reviews: %d
                1–2 Star Reviews: %d (reputation risk)

                RECENT REVIEW SAMPLES:
                %s

                COMPETITOR LANDSCAPE:
                %s

                RECENT POSTS HISTORY:
                %s

                INSTRUCTIONS:
                Provide a structured growth plan with these exact sections:

                ## 🎯 Overall Assessment
                Rate the business out of 10 and explain why in 2–3 sentences.

                ## 🚨 Urgent Actions (Do This Week)
                List 3–5 things that need immediate attention (unanswered reviews, missing info, etc.)

                ## ⭐ Review Growth Strategy
                How to get more 5-star reviews from real customers. Give specific scripts and tactics for India.

                ## 📝 30-Day Content Calendar
                Week-by-week Google Business post plan (type + topic + best day to post).

                ## 🔍 Local SEO Improvements
                5 specific changes to improve Google Maps ranking for this category and location.

                ## 🏆 Beat the Competitors
                Based on competitor data, where is the gap? What 3 things can this business do better?

                ## 📱 WhatsApp & Customer Engagement
                How to use WhatsApp and local marketing channels to drive more Google reviews and repeat visits.

                ## 📊 30-Day KPIs to Track
                3–5 metrics the owner should check weekly to measure growth.
                """,
                location.getName(),
                location.getCategory() != null ? location.getCategory() : "Local Business",
                location.getAddress() != null ? location.getAddress() : "India",
                location.getWebsite() != null ? location.getWebsite() : "Not set",
                location.getPhone() != null ? location.getPhone() : "Not set",
                totalReviews, avgRating, unanswered, fiveStars, oneToTwo,
                reviewComments.toString(),
                competitorSummary.length() > 0 ? competitorSummary.toString() : "No competitors tracked yet.",
                postHistory.length() > 0 ? postHistory.toString() : "No posts published yet."
        );

        log.info("Generating Claude growth plan for location: {}", location.getName());
        return aiService.generateContent(system, prompt);
    }

    public String askAdvisor(String locationId, String question) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));

        List<Review> reviews = reviewRepository.findByLocationId(locationId);
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        String system = """
                You are a local business growth advisor and Google Business Profile expert specialising in Indian markets.
                Answer the business owner's question clearly and practically. Be direct and actionable.
                Always relate advice to their specific business context.
                """;

        String prompt = String.format("""
                Business: %s (%s) in %s
                Average Rating: %.1f/5 based on %d reviews

                Owner's Question: %s

                Give a practical, specific answer tailored to this Indian local business.
                """,
                location.getName(),
                location.getCategory() != null ? location.getCategory() : "Local Business",
                location.getAddress() != null ? location.getAddress() : "India",
                avgRating, reviews.size(), question);

        return aiService.generateContent(system, prompt);
    }
}
