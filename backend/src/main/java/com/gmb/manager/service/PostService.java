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

        String systemInstruction = String.format(
                "You are GMB AI Manager, an expert social media copywriter specializing in local business marketing for '%s', which is a '%s' business. " +
                "Write a highly engaging, short Google Business Profile post (maximum 300 words). " +
                "The content must be highly relevant and tailored to a '%s' business. " +
                "Importantly, customize the post to the business's region (e.g. India, USA, Europe) based on their address and name. Use appropriate regional spellings (e.g., 'colour' or 'specialise' for India/Europe/UK, 'color' or 'specialize' for USA), formatting conventions, and local expressions. " +
                "Include a clear call to action at the bottom and relevant, subtle emojis.",
                location.getName(), location.getCategory(), location.getCategory()
        );

        String prompt = String.format(
                "Generate a Google Business Profile post.\n" +
                "Business Name: %s\n" +
                "Category: %s\n" +
                "Address: %s\n" +
                "Post Type: %s\n" +
                "Post Topic/Instructions: %s\n\n" +
                "Generate ONLY the final post text with no titles or surrounding quotes.",
                location.getName(),
                location.getCategory(),
                location.getAddress(),
                postType,
                topic != null && !topic.trim().isEmpty() ? topic : "General updates and customer thank you"
        );

        String generatedContent = aiService.generateContent(systemInstruction, prompt);

        String mediaUrl = null;
        if (includeImage) {
            mediaUrl = suggestImageUrl(location.getCategory());
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

    private String suggestImageUrl(String category) {
        if (category == null) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600";
        String catLower = category.toLowerCase();
        
        if (catLower.contains("salon") || catLower.contains("hair") || catLower.contains("beauty") || catLower.contains("spa") || catLower.contains("barber")) {
            return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600"; // Salon
        } else if (catLower.contains("plumb") || catLower.contains("leak") || catLower.contains("repair") || catLower.contains("electric")) {
            return "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600"; // Services
        } else if (catLower.contains("rest") || catLower.contains("cafe") || catLower.contains("food") || catLower.contains("dine") || catLower.contains("pizza") || catLower.contains("bakery")) {
            return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"; // Dining
        } else if (catLower.contains("shop") || catLower.contains("store") || catLower.contains("boutique") || catLower.contains("retail") || catLower.contains("market")) {
            return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"; // Shop
        } else if (catLower.contains("dent") || catLower.contains("medic") || catLower.contains("clin") || catLower.contains("health") || catLower.contains("doctor")) {
            return "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600"; // Health
        }
        
        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"; // General business
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
