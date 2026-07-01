package com.gmb.manager.service;

import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Post;
import com.gmb.manager.entity.PostSeoMetrics;
import com.gmb.manager.entity.Review;
import com.gmb.manager.repository.PostSeoMetricsRepository;
import com.gmb.manager.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeoOptimizationService {

    private final PostSeoMetricsRepository postSeoMetricsRepository;
    private final ReviewRepository reviewRepository;
    private final AiService aiService;

    public String generateSeoOptimizedContent(String originalContent, Location location, List<String> suggestedKeywords) {
        log.info("Generating SEO-optimized content for location {}", location.getName());

        String systemPrompt = "You are an expert local SEO specialist. Your task is to optimize a Google Business Profile post " +
                "for maximum local search visibility. Maintain the original message while injecting keywords naturally. " +
                "Keep it professional and engaging. Return ONLY the optimized text.";

        String keywordString = String.join(", ", suggestedKeywords);
        String userPrompt = String.format(
                "Optimize this GMB post for local search:\n\n" +
                "ORIGINAL POST:\n%s\n\n" +
                "BUSINESS: %s\n" +
                "CATEGORY: %s\n" +
                "LOCATION: %s\n\n" +
                "TARGET KEYWORDS (inject 3-5 naturally):\n%s\n\n" +
                "OPTIMIZE FOR:\n" +
                "- Include location name 1-2 times\n" +
                "- Add 3-5 relevant keywords naturally\n" +
                "- Include 2-3 relevant hashtags\n" +
                "- Add call-to-action (Call, Visit, Book, etc.)\n" +
                "- Keep under 300 characters\n" +
                "- Optimize for mobile reading\n" +
                "- Use 1-2 relevant emojis\n\n" +
                "Return ONLY the optimized post text.",
                originalContent, location.getName(), location.getCategory(),
                location.getAddress(), keywordString
        );

        try {
            return aiService.generateContent(systemPrompt, userPrompt);
        } catch (Exception e) {
            log.warn("Failed to optimize content with AI, returning original");
            return originalContent;
        }
    }

    public PostSeoMetrics calculateSeoMetrics(Post post, String optimizedContent, Location location) {
        log.info("Calculating SEO metrics for post {}", post.getId());

        List<Review> reviews = reviewRepository.findByLocationId(post.getLocationId());
        List<String> keywordsFromReviews = extractKeywordsFromReviews(reviews);

        PostSeoMetrics metrics = PostSeoMetrics.builder()
                .postId(post.getId())
                .locationId(post.getLocationId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        metrics.setTargetKeywords(keywordsFromReviews);
        metrics.setKeywordDensity(calculateKeywordDensity(optimizedContent, keywordsFromReviews));
        metrics.setReadabilityScore(calculateReadabilityScore(optimizedContent));
        metrics.setContentLength(optimizedContent.split("\\s+").length);
        metrics.setHashtagCount(countHashtags(optimizedContent));
        metrics.setEmojiCount(countEmojis(optimizedContent));
        metrics.setCallToActionPresent(hasCallToAction(optimizedContent));
        metrics.setLocalityMentions(countLocalityMentions(optimizedContent, location));
        metrics.setMobileOptimized(optimizedContent.length() <= 300);
        metrics.setSeoScore(calculateSeoScore(metrics));
        metrics.setEstimatedReach(estimateReach(metrics));

        return metrics;
    }

    public List<String> extractKeywordsFromReviews(List<Review> reviews) {
        Map<String, Integer> keywordFreq = new HashMap<>();

        // Common positive keywords for businesses
        String[] keywords = {
            "service", "quality", "professional", "friendly", "fast", "reliable",
            "excellent", "best", "recommend", "great", "amazing", "helpful",
            "responsive", "clean", "fresh", "experienced", "skilled", "affordable",
            "efficient", "impressive", "outstanding", "top-rated", "premium"
        };

        for (Review review : reviews) {
            if (review.getComment() != null) {
                String comment = review.getComment().toLowerCase();
                for (String keyword : keywords) {
                    if (comment.contains(keyword)) {
                        keywordFreq.put(keyword, keywordFreq.getOrDefault(keyword, 0) + 1);
                    }
                }
            }
        }

        return keywordFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private Double calculateKeywordDensity(String content, List<String> keywords) {
        if (keywords.isEmpty() || content.isEmpty()) return 0.0;

        String[] words = content.toLowerCase().split("\\s+");
        long keywordCount = Arrays.stream(words)
                .filter(word -> keywords.stream().anyMatch(k -> word.contains(k)))
                .count();

        return (keywordCount * 100.0) / words.length;
    }

    private Double calculateReadabilityScore(String content) {
        // Simplified Flesch reading ease (0-100)
        String[] sentences = content.split("[.!?]+");
        String[] words = content.split("\\s+");
        String[] syllables = content.split("[aeiouAEIOU]+");

        if (words.length == 0) return 50.0;

        double score = 206.835 - (1.015 * (words.length / Math.max(sentences.length, 1))) -
                       (84.6 * (syllables.length / Math.max(words.length, 1)));

        return Math.max(0, Math.min(100, score));
    }

    private Integer countHashtags(String content) {
        return (int) content.chars().filter(c -> c == '#').count();
    }

    private Integer countEmojis(String content) {
        Pattern emojiPattern = Pattern.compile("[😀-\ud83dude4f]|[🌀-🍷]" +
                "|[🈀-🉯]|[🊀-🋿]");
        Matcher matcher = emojiPattern.matcher(content);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    private Boolean hasCallToAction(String content) {
        String[] ctas = {"call", "visit", "book", "order", "reserve", "shop", "apply",
                         "click", "contact", "learn more", "get", "try", "join", "sign up"};
        String lower = content.toLowerCase();
        return Arrays.stream(ctas).anyMatch(lower::contains);
    }

    private Integer countLocalityMentions(String content, Location location) {
        int count = 0;
        String lower = content.toLowerCase();

        if (location.getAddress() != null) {
            String[] parts = location.getAddress().split(",");
            for (String part : parts) {
                if (lower.contains(part.toLowerCase().trim())) {
                    count++;
                }
            }
        }

        if (location.getName() != null && lower.contains(location.getName().toLowerCase())) {
            count++;
        }

        return count;
    }

    private Integer calculateSeoScore(PostSeoMetrics metrics) {
        int score = 50; // Base score

        if (metrics.getKeywordDensity() >= 2 && metrics.getKeywordDensity() <= 5) score += 15;
        else if (metrics.getKeywordDensity() > 0) score += 10;

        if (metrics.getReadabilityScore() >= 60) score += 15;
        else if (metrics.getReadabilityScore() >= 40) score += 10;

        if (Boolean.TRUE.equals(metrics.getCallToActionPresent())) score += 10;
        if (metrics.getLocalityMentions() >= 2) score += 10;
        if (metrics.getHashtagCount() >= 2 && metrics.getHashtagCount() <= 5) score += 10;
        if (Boolean.TRUE.equals(metrics.getMobileOptimized())) score += 10;
        if (metrics.getEmojiCount() >= 1 && metrics.getEmojiCount() <= 3) score += 5;

        return Math.min(100, score);
    }

    private Integer estimateReach(PostSeoMetrics metrics) {
        // Estimate visibility based on SEO factors
        return (int) (metrics.getSeoScore() * 0.8 +
                      (metrics.getKeywordDensity() > 0 ? 10 : 0) +
                      (Boolean.TRUE.equals(metrics.getCallToActionPresent()) ? 5 : 0));
    }

    public PostSeoMetrics getOrCreateMetrics(Post post, Location location) {
        Optional<PostSeoMetrics> existing = postSeoMetricsRepository.findByPostId(post.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        List<Review> reviews = reviewRepository.findByLocationId(post.getLocationId());
        List<String> keywords = extractKeywordsFromReviews(reviews);

        PostSeoMetrics metrics = calculateSeoMetrics(post, post.getContent(), location);
        return postSeoMetricsRepository.save(metrics);
    }
}
