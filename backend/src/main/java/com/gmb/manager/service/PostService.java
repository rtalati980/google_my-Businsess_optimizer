package com.gmb.manager.service;

import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Post;
import com.gmb.manager.entity.PostSeoMetrics;
import com.gmb.manager.entity.Review;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.PostRepository;
import com.gmb.manager.repository.PostSeoMetricsRepository;
import com.gmb.manager.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final LocationRepository locationRepository;
    private final PostSeoMetricsRepository postSeoMetricsRepository;
    private final ReviewRepository reviewRepository;
    private final AiService aiService;
    private final GmbService gmbService;
    private final SeoOptimizationService seoOptimizationService;

    public List<Post> getPostsByLocation(String locationId) {
        return postRepository.findByLocationId(locationId);
    }

    public Post generatePost(String locationId, String postType, String topic) {
        return generatePost(locationId, postType, topic, false);
    }

    public Post generatePost(String locationId, String postType, String topic, boolean includeImage) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));

        // Get customer reviews to understand what customers love about this business
        List<Review> reviews = reviewRepository.findByLocationId(locationId);
        String reviewSummary = extractPositiveReviewThemes(reviews);

        String systemInstruction = String.format(
                "You are GMB AI Manager, an expert social media copywriter specializing in local business marketing for '%s', which is a '%s' business. " +
                "Write a VERY SHORT, highly engaging Google Business Profile post (MAXIMUM 280 CHARACTERS) that is SPECIFIC to this exact business. " +
                "Reference what customers love about this business (based on their reviews). " +
                "The content must be UNIQUE to '%s' - not generic. " +
                "Customize to the business's region (India/USA/Europe) with appropriate spellings. " +
                "Include relevant emojis and a strong call to action.\n" +
                "Customer feedback themes: %s\n\n" +
                "CRITICAL: Your response MUST be under 280 characters. Count every character including spaces and emojis.",
                location.getName(), location.getCategory(), location.getName(), reviewSummary
        );

        String prompt = String.format(
                "Generate a CONCISE Google Business Profile post for THIS SPECIFIC BUSINESS:\n\n" +
                "Business Name: %s\n" +
                "Category: %s\n" +
                "Post Type: %s\n" +
                "Topic: %s\n\n" +
                "STRICT REQUIREMENTS:\n" +
                "1. Keep it UNDER 280 characters (count spaces and emojis!)\n" +
                "2. Be SPECIFIC to %s\n" +
                "3. Include what customers love\n" +
                "4. Add relevant emoji(s)\n" +
                "5. Strong call-to-action\n\n" +
                "Return ONLY the post text. No quotes, no titles, no extra text.",
                location.getName(),
                location.getCategory(),
                postType,
                topic != null && !topic.trim().isEmpty() ? topic : "Share what makes this business special",
                location.getName()
        );

        String generatedContent = aiService.generateContent(systemInstruction, prompt);

        // ENFORCE 300 char limit - truncate if needed
        if (generatedContent.length() > 300) {
            generatedContent = generatedContent.substring(0, 295) + "...";
            log.warn("Post truncated from {} to 298 chars", generatedContent.length());
        }

        String mediaUrl = null;
        if (includeImage) {
            mediaUrl = suggestBusinessSpecificImage(location.getCategory(), location.getName());
        }

        Post post = Post.builder()
                .locationId(locationId)
                .topic(topic != null && !topic.trim().isEmpty() ? topic : "Weekly Update")
                .content(generatedContent)
                .mediaUrl(mediaUrl)
                .postType(postType.toUpperCase())
                .status("DRAFT")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return postRepository.save(post);
    }

    private String extractPositiveReviewThemes(List<Review> reviews) {
        if (reviews.isEmpty()) return "Great customer service, quality work, friendly staff";

        // Extract positive themes from high-rated reviews
        StringBuilder themes = new StringBuilder();
        reviews.stream()
                .filter(r -> r.getRating() >= 4)
                .limit(3)
                .forEach(r -> {
                    if (r.getComment() != null && !r.getComment().isEmpty()) {
                        themes.append(r.getComment().substring(0, Math.min(50, r.getComment().length()))).append("; ");
                    }
                });

        return themes.length() > 0 ? themes.toString() : "Excellent service, professional staff, highly recommended";
    }

    private String suggestBusinessSpecificImage(String category, String businessName) {
        if (category == null && businessName == null) {
            return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80";
        }
        String catLower = (category != null) ? category.toLowerCase() : "";
        String nameLower = (businessName != null) ? businessName.toLowerCase() : "";
        String combined = catLower + " " + nameLower;

        // Software / IT / Tech / Digital
        if (combined.contains("software") || combined.contains("tech") || combined.contains("code") ||
            combined.contains("digital") || combined.contains("it ") || combined.contains("web") ||
            combined.contains("app") || combined.contains("developer") || combined.contains("programming")) {
            return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80"; // Code/Tech workspace
        }
        // Marketing / Agency / Creative
        else if (combined.contains("marketing") || combined.contains("agency") || combined.contains("creative") ||
                 combined.contains("design") || combined.contains("branding")) {
            return "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80"; // Team brainstorm
        }
        // Salon / Beauty / Spa
        else if (combined.contains("salon") || combined.contains("hair") || combined.contains("beauty") ||
                 combined.contains("spa") || combined.contains("parlour") || combined.contains("parlor")) {
            return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"; // Beauty salon
        }
        // Restaurant / Cafe / Food
        else if (combined.contains("restaurant") || combined.contains("cafe") || combined.contains("food") ||
                 combined.contains("dine") || combined.contains("kitchen") || combined.contains("biryani")) {
            return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"; // Restaurant
        }
        // Dental / Clinic / Hospital / Medical
        else if (combined.contains("dental") || combined.contains("dentist") || combined.contains("clinic") ||
                 combined.contains("hospital") || combined.contains("medical") || combined.contains("doctor")) {
            return "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80"; // Medical clinic
        }
        // Auto / Mechanic / Garage
        else if (combined.contains("garage") || combined.contains("auto") || combined.contains("mechanic") ||
                 combined.contains("repair") || combined.contains("car")) {
            return "https://images.unsplash.com/photo-1487754180144-351b8e906e6f?w=600&q=80"; // Auto repair
        }
        // Hotel / Resort / Hospitality
        else if (combined.contains("hotel") || combined.contains("resort") || combined.contains("hospitality") ||
                 combined.contains("lodge") || combined.contains("inn")) {
            return "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"; // Hotel
        }
        // Retail / Shop / Store
        else if (combined.contains("shop") || combined.contains("store") || combined.contains("retail") ||
                 combined.contains("boutique")) {
            return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"; // Retail
        }
        // Gym / Fitness
        else if (combined.contains("gym") || combined.contains("fitness") || combined.contains("yoga") ||
                 combined.contains("crossfit")) {
            return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"; // Fitness
        }
        // Bakery / Cake
        else if (combined.contains("bakery") || combined.contains("cake") || combined.contains("pastry") ||
                 combined.contains("confection")) {
            return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80"; // Bakery
        }
        // Education / School / Coaching / Tutor
        else if (combined.contains("education") || combined.contains("school") || combined.contains("coaching") ||
                 combined.contains("tutor") || combined.contains("academy") || combined.contains("institute")) {
            return "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80"; // Education
        }
        // Real Estate / Property
        else if (combined.contains("real estate") || combined.contains("property") || combined.contains("realty") ||
                 combined.contains("builder")) {
            return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"; // Real estate
        }
        // Law / Legal / Attorney
        else if (combined.contains("law") || combined.contains("legal") || combined.contains("attorney") ||
                 combined.contains("advocate")) {
            return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80"; // Law office
        }
        // Photography / Studio
        else if (combined.contains("photo") || combined.contains("studio") || combined.contains("videograph")) {
            return "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80"; // Photography
        }
        // Consulting / Professional Services
        else if (combined.contains("consult") || combined.contains("advisory") || combined.contains("accounting") ||
                 combined.contains("chartered")) {
            return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80"; // Consulting
        }

        // Default fallback — professional office
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";
    }

    public Post updatePost(String postId, String content) {
        return updatePost(postId, content, null);
    }

    public Post updatePost(String postId, String content, String mediaUrl) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));

        post.setContent(content);
        if (mediaUrl != null) {
            post.setMediaUrl(mediaUrl);
        }
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post publishPost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));

        // Call Google GMB API to publish post (simulated in sandbox, real POST call in production)
        gmbService.publishGmbPost(postId);

        post.setStatus("PUBLISHED");
        post.setPublishedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Map<String, Object> generateOptimizedPost(String locationId, String postType, String topic, boolean includeImage) {
        log.info("Generating SEO-optimized post for location {}", locationId);

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));

        // Generate initial post
        Post initialPost = generatePost(locationId, postType, topic, includeImage);

        // Extract keywords from reviews for SEO optimization
        List<Review> reviews = reviewRepository.findByLocationId(locationId);
        List<String> suggestedKeywords = seoOptimizationService.extractKeywordsFromReviews(reviews);

        // Optimize content for SEO
        String optimizedContent = seoOptimizationService.generateSeoOptimizedContent(
                initialPost.getContent(), location, suggestedKeywords
        );

        // Enforce 300 char limit after SEO optimization
        if (optimizedContent.length() > 300) {
            optimizedContent = optimizedContent.substring(0, 295) + "...";
            log.warn("Optimized post truncated to 298 chars after SEO optimization");
        }

        initialPost.setContent(optimizedContent);
        initialPost.setUpdatedAt(LocalDateTime.now());
        Post savedPost = postRepository.save(initialPost);

        // Calculate SEO metrics
        PostSeoMetrics metrics = seoOptimizationService.calculateSeoMetrics(savedPost, optimizedContent, location);
        PostSeoMetrics savedMetrics = postSeoMetricsRepository.save(metrics);

        Map<String, Object> result = new HashMap<>();
        result.put("post", savedPost);
        result.put("seoMetrics", savedMetrics);
        result.put("optimization", Map.of(
                "seoScore", savedMetrics.getSeoScore(),
                "targetKeywords", savedMetrics.getTargetKeywords(),
                "estimatedReach", savedMetrics.getEstimatedReach(),
                "keywordDensity", String.format("%.1f%%", savedMetrics.getKeywordDensity()),
                "readabilityScore", String.format("%.1f", savedMetrics.getReadabilityScore()),
                "callToActionPresent", savedMetrics.getCallToActionPresent(),
                "localityMentions", savedMetrics.getLocalityMentions(),
                "mobileOptimized", savedMetrics.getMobileOptimized()
        ));

        return result;
    }

    public PostSeoMetrics getSeoMetrics(String postId) {
        return postSeoMetricsRepository.findByPostId(postId)
                .orElseThrow(() -> new IllegalArgumentException("SEO metrics not found for post: " + postId));
    }

    public List<PostSeoMetrics> getHighScoringPosts(String locationId, Integer minScore) {
        return postSeoMetricsRepository.findByLocationIdAndSeoScoreGreaterThanEqualOrderBySeoScoreDesc(locationId, minScore);
    }
}
