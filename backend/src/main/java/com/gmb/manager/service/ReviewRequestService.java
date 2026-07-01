package com.gmb.manager.service;

import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.ReviewRequest;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.ReviewRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewRequestService {

    private final ReviewRequestRepository reviewRequestRepository;
    private final LocationRepository locationRepository;
    private final AiService aiService;

    public List<ReviewRequest> generateReviewRequests(String locationId, List<Map<String, String>> customers, String requestType) {
        log.info("Generating review requests for location {} with {} customers via {}", locationId, customers.size(), requestType);

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found: " + locationId));

        List<ReviewRequest> generated = new ArrayList<>();

        for (Map<String, String> customer : customers) {
            String customerName = customer.get("name");
            String customerPhone = customer.get("phone");
            String customerEmail = customer.get("email");

            if (customerName == null || customerName.trim().isEmpty()) {
                continue;
            }

            String message = generateAiMessage(location, customerName, requestType);

            ReviewRequest request = ReviewRequest.builder()
                    .locationId(locationId)
                    .customerPhone(customerPhone)
                    .customerEmail(customerEmail)
                    .customerName(customerName)
                    .requestType(requestType)
                    .status("PENDING")
                    .templateType("AUTO_GENERATED")
                    .generatedMessage(message)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            generated.add(reviewRequestRepository.save(request));
        }

        log.info("Generated {} review requests for location {}", generated.size(), locationId);
        return generated;
    }

    private String generateAiMessage(Location location, String customerName, String requestType) {
        String systemPrompt = "You are a professional business owner requesting a Google review from a customer. " +
                "Generate a personalized, brief message that encourages them to leave a review without being pushy. " +
                "Keep it to 1-2 sentences max.";

        String userPrompt = String.format(
                "Generate a review request message for: %s\n" +
                "Business: %s\n" +
                "Category: %s\n" +
                "Message type: %s (should be appropriate for %s)\n\n" +
                "Return ONLY the message text, no quotes or extra text.",
                customerName, location.getName(), location.getCategory(),
                requestType, requestType.equals("SMS") ? "text" : (requestType.equals("EMAIL") ? "email subject + body" : "WhatsApp")
        );

        try {
            return aiService.generateContent(systemPrompt, userPrompt);
        } catch (Exception e) {
            log.warn("Failed to generate AI message, using fallback for {}", customerName);
            return generateFallbackMessage(customerName, location.getName(), requestType);
        }
    }

    private String generateFallbackMessage(String customerName, String businessName, String requestType) {
        if ("EMAIL".equals(requestType)) {
            return String.format("Hi %s, we'd love to hear about your experience at %s! Could you take 30 seconds to leave a review on Google? Your feedback helps us improve.", customerName, businessName);
        } else if ("WHATSAPP".equals(requestType)) {
            return String.format("Hi %s 👋 Thank you for visiting %s! We'd appreciate if you could leave a quick review on Google. 🌟", customerName, businessName);
        } else {
            return String.format("Hi %s, please review us on Google! goo.gl/reviews", customerName);
        }
    }

    public List<ReviewRequest> sendReviewRequests(String locationId, List<String> requestIds) {
        log.info("Sending {} review requests for location {}", requestIds.size(), locationId);

        List<ReviewRequest> requests = reviewRequestRepository.findById(requestIds);
        List<ReviewRequest> sent = new ArrayList<>();

        for (ReviewRequest request : requests) {
            if (!request.getLocationId().equals(locationId)) {
                log.warn("Request {} does not belong to location {}", request.getId(), locationId);
                continue;
            }

            if ("SMS".equals(request.getRequestType())) {
                sendSms(request);
            } else if ("EMAIL".equals(request.getRequestType())) {
                sendEmail(request);
            } else if ("WHATSAPP".equals(request.getRequestType())) {
                sendWhatsApp(request);
            }

            request.setStatus("SENT");
            request.setSentAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());
            sent.add(reviewRequestRepository.save(request));
        }

        log.info("Sent {} review requests", sent.size());
        return sent;
    }

    private void sendSms(ReviewRequest request) {
        log.info("Mock SMS sending to {} for customer {}", request.getCustomerPhone(), request.getCustomerName());
        // In production, integrate with Twilio or AWS SNS
        // twilio.sendSms(request.getCustomerPhone(), request.getGeneratedMessage());
    }

    private void sendEmail(ReviewRequest request) {
        log.info("Mock Email sending to {} for customer {}", request.getCustomerEmail(), request.getCustomerName());
        // In production, integrate with SendGrid or AWS SES
        // sendGrid.send(request.getCustomerEmail(), request.getGeneratedMessage());
    }

    private void sendWhatsApp(ReviewRequest request) {
        log.info("Mock WhatsApp sending to {} for customer {}", request.getCustomerPhone(), request.getCustomerName());
        // In production, integrate with WhatsApp Business API
        // whatsapp.send(request.getCustomerPhone(), request.getGeneratedMessage());
    }

    public List<ReviewRequest> getReviewRequests(String locationId) {
        return reviewRequestRepository.findByLocationIdOrderByCreatedAtDesc(locationId);
    }

    public List<ReviewRequest> getReviewRequestsByStatus(String locationId, String status) {
        return reviewRequestRepository.findByLocationIdAndStatus(locationId, status);
    }

    public Map<String, Object> getReviewRequestStats(String locationId) {
        List<ReviewRequest> allRequests = reviewRequestRepository.findByLocationId(locationId);

        long totalRequests = allRequests.size();
        long sentCount = allRequests.stream().filter(r -> "SENT".equals(r.getStatus())).count();
        long completedCount = allRequests.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        long respondedCount = allRequests.stream().filter(r -> "RESPONDED".equals(r.getStatus())).count();

        double conversionRate = totalRequests > 0 ? (completedCount * 100.0 / sentCount) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRequests", totalRequests);
        stats.put("sentRequests", sentCount);
        stats.put("respondedRequests", respondedCount);
        stats.put("completedRequests", completedCount);
        stats.put("conversionRate", String.format("%.1f%%", conversionRate));
        stats.put("bySMSCount", allRequests.stream().filter(r -> "SMS".equals(r.getRequestType())).count());
        stats.put("byEmailCount", allRequests.stream().filter(r -> "EMAIL".equals(r.getRequestType())).count());
        stats.put("byWhatsAppCount", allRequests.stream().filter(r -> "WHATSAPP".equals(r.getRequestType())).count());

        return stats;
    }

    public void markAsCompleted(String reviewRequestId) {
        ReviewRequest request = reviewRequestRepository.findById(reviewRequestId)
                .orElseThrow(() -> new IllegalArgumentException("ReviewRequest not found: " + reviewRequestId));

        request.setStatus("COMPLETED");
        request.setReviewCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        reviewRequestRepository.save(request);

        log.info("Marked review request {} as completed", reviewRequestId);
    }
}
