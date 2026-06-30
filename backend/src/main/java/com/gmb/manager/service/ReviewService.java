package com.gmb.manager.service;

import com.gmb.manager.entity.Review;
import com.gmb.manager.entity.ReviewReply;
import com.gmb.manager.entity.Location;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.ReviewReplyRepository;
import com.gmb.manager.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final LocationRepository locationRepository;
    private final AiService aiService;

    public Page<Review> getReviews(String locationId, List<Integer> ratings, Pageable pageable) {
        if (ratings == null || ratings.isEmpty()) {
            return reviewRepository.findByLocationId(locationId, pageable);
        } else {
            return reviewRepository.findByLocationIdAndRatingIn(locationId, ratings, pageable);
        }
    }

    public ReviewReply generateAiReply(String reviewId, String tone) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));

        Location location = locationRepository.findById(review.getLocationId()).orElse(null);
        String businessName = (location != null && location.getName() != null) ? location.getName() : "our business";
        String businessCategory = (location != null && location.getCategory() != null) ? location.getCategory() : "local business";
        String businessAddress = (location != null && location.getAddress() != null) ? location.getAddress() : "";

        String systemInstruction = String.format(
                "You are an expert customer response writer for '%s', which is a '%s'. " +
                "Your task is to write a personalized reply to a Google Business review from a customer. " +
                "You must write responses matching the requested tone precisely. " +
                "Customize the response specifically to the type of business '%s' (e.g. styling/appointments for salons, service/repairs for plumbers). " +
                "Importantly, detect the country/region (e.g., India, USA, Europe) from the business address and reviewer name, and adapt the spelling (e.g., UK vs US English, 'colour' vs 'color'), local vocabulary (e.g., 'saloon' for hair salon in India), and cultural etiquette. For Indian businesses, use warm, highly respectful phrasing. For US/Europe, match local standards. " +
                "Keep it concise, professional, respectful, and directly addressing the user's feedback.",
                businessName, businessCategory, businessCategory
        );

        String prompt = String.format(
                "Write a reply to this customer review:\n" +
                "Business Name: %s\n" +
                "Business Category: %s\n" +
                "Business Address: %s\n" +
                "Reviewer: %s\n" +
                "Rating: %d stars\n" +
                "Review Comment: \"%s\"\n" +
                "Requested Tone: %s\n\n" +
                "Generate ONLY the final response text without greetings like 'Subject:' or surrounding quotes.",
                businessName,
                businessCategory,
                businessAddress,
                review.getReviewerName(),
                review.getRating(),
                review.getComment() != null ? review.getComment() : "(No text review provided, just stars)",
                tone
        );

        String generatedText = aiService.generateContent(systemInstruction, prompt);

        Optional<ReviewReply> existingOpt = reviewReplyRepository.findByReviewId(reviewId);
        ReviewReply reply;
        if (existingOpt.isPresent()) {
            reply = existingOpt.get();
            reply.setReplyText(generatedText);
            reply.setTone(tone.toUpperCase());
            reply.setGeneratedBy("AI");
            reply.setUpdatedAt(LocalDateTime.now());
        } else {
            reply = ReviewReply.builder()
                    .reviewId(reviewId)
                    .replyText(generatedText)
                    .tone(tone.toUpperCase())
                    .generatedBy("AI")
                    .isPublished(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        return reviewReplyRepository.save(reply);
    }

    public ReviewReply publishReply(String replyId) {
        ReviewReply reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("Reply not found with id: " + replyId));

        reply.setIsPublished(true);
        reply.setPublishedAt(LocalDateTime.now());
        reply.setUpdatedAt(LocalDateTime.now());

        reviewRepository.findById(reply.getReviewId()).ifPresent(review -> {
            review.setStatus("ANSWERED");
            review.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);
        });

        return reviewReplyRepository.save(reply);
    }

    public Optional<ReviewReply> getReplyForReview(String reviewId) {
        return reviewReplyRepository.findByReviewId(reviewId);
    }

    public ReviewReply saveReplyDraft(String reviewId, String replyText, String tone) {
        reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));

        Optional<ReviewReply> existingOpt = reviewReplyRepository.findByReviewId(reviewId);
        ReviewReply reply;
        if (existingOpt.isPresent()) {
            reply = existingOpt.get();
            reply.setReplyText(replyText);
            reply.setTone(tone.toUpperCase());
            reply.setGeneratedBy("MANUAL");
            reply.setUpdatedAt(LocalDateTime.now());
        } else {
            reply = ReviewReply.builder()
                    .reviewId(reviewId)
                    .replyText(replyText)
                    .tone(tone.toUpperCase())
                    .generatedBy("MANUAL")
                    .isPublished(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        return reviewReplyRepository.save(reply);
    }

    public java.util.Map<String, Object> getSentimentAnalysis(String locationId) {
        List<Review> reviews = reviewRepository.findByLocationId(locationId);

        long totalReviews = reviews.size();
        long positive = reviews.stream().filter(r -> r.getRating() >= 4).count();
        long neutral = reviews.stream().filter(r -> r.getRating() == 3).count();
        long negative = reviews.stream().filter(r -> r.getRating() <= 2).count();

        double avgRating = totalReviews == 0 ? 0.0 :
            reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        long answered = reviews.stream().filter(r -> "ANSWERED".equals(r.getStatus())).count();
        double responseRate = totalReviews == 0 ? 0.0 : (double) answered / totalReviews * 100.0;

        java.util.Map<String, Integer> keywordMap = new java.util.HashMap<>();
        String[] keywordsToTrack = {"website", "support", "responsive", "service", "professional", "premium", "quality", "experience", "clean", "fast", "recommend"};
        for (Review r : reviews) {
            if (r.getComment() != null) {
                String commentLower = r.getComment().toLowerCase();
                for (String kw : keywordsToTrack) {
                    if (commentLower.contains(kw)) {
                        keywordMap.put(kw, keywordMap.getOrDefault(kw, 0) + 1);
                    }
                }
            }
        }

        List<java.util.Map<String, Object>> keywordList = new java.util.ArrayList<>();
        keywordMap.forEach((k, v) -> {
            java.util.Map<String, Object> kw = new java.util.HashMap<>();
            kw.put("name", k);
            kw.put("value", v);
            keywordList.add(kw);
        });
        keywordList.sort((a, b) -> Integer.compare((Integer) b.get("value"), (Integer) a.get("value")));

        List<java.util.Map<String, Object>> trend = new java.util.ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        int currentMonth = LocalDateTime.now().getMonthValue() - 1;
        for (int i = 5; i >= 0; i--) {
            int mIdx = (currentMonth - i + 12) % 12;
            java.util.Map<String, Object> monthData = new java.util.HashMap<>();
            monthData.put("name", months[mIdx]);
            monthData.put("positive", totalReviews > 0 ? Math.max(1, (int)(positive / 6.0)) : 0);
            monthData.put("neutral", totalReviews > 0 ? (int)(neutral / 6.0) : 0);
            monthData.put("negative", totalReviews > 0 ? (int)(negative / 6.0) : 0);
            monthData.put("count", totalReviews > 0 ? Math.max(1, (int)(totalReviews / 6.0)) : 0);
            trend.add(monthData);
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalReviews", totalReviews);
        result.put("positiveCount", positive);
        result.put("neutralCount", neutral);
        result.put("negativeCount", negative);
        result.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        result.put("responseRate", Math.round(responseRate * 10.0) / 10.0);
        result.put("topKeywords", keywordList);
        result.put("monthlyTrends", trend);

        return result;
    }
}
