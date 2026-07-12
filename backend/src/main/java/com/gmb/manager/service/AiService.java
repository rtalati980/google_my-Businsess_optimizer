package com.gmb.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_TOKENS = 2048;
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    /**
     * Generates content using Google Gemini API. If the API key is empty or errors occur,
     * falls back to business-aware mock content.
     */
    public String generateContent(String systemInstruction, String userPrompt) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("your-gemini-api-key-here")) {
            log.info("Using simulation mode for AI generation (no valid Gemini API key configured)");
            return simulateResponse(systemInstruction, userPrompt);
        }

        try {
            String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build Gemini API request body
            Map<String, Object> requestBody = new HashMap<>();

            // System instruction
            if (systemInstruction != null && !systemInstruction.trim().isEmpty()) {
                Map<String, Object> systemInstructionObj = new HashMap<>();
                Map<String, String> systemPart = new HashMap<>();
                systemPart.put("text", systemInstruction);
                systemInstructionObj.put("parts", List.of(systemPart));
                requestBody.put("systemInstruction", systemInstructionObj);
            }

            // User content
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            Map<String, String> userPart = new HashMap<>();
            userPart.put("text", userPrompt);
            userContent.put("parts", List.of(userPart));
            requestBody.put("contents", List.of(userContent));

            // Generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", MAX_TOKENS);
            generationConfig.put("temperature", 0.8);
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Google Gemini API with model: {}", geminiModel);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode content = candidates.get(0).path("content").path("parts");
                    if (content.isArray() && !content.isEmpty()) {
                        String text = content.get(0).path("text").asText();
                        if (!text.isEmpty()) {
                            log.debug("Successfully generated content from Google Gemini");
                            return text.trim();
                        }
                    }
                }
            }
            throw new RuntimeException("Unexpected response format from Gemini API");
        } catch (Exception e) {
            log.error("Error calling Google Gemini API: {}. Falling back to simulated response.", e.getMessage(), e);
            return simulateResponse(systemInstruction, userPrompt);
        }
    }

    /**
     * Business-aware simulation — parses business name, category, and context from the prompt
     * to generate personalized mock content instead of generic text.
     */
    private String simulateResponse(String system, String prompt) {
        String query = prompt.toLowerCase();

        // Extract business context from the prompt
        String businessName = extractField(prompt, "Business Name:");
        String category = extractField(prompt, "Business Category:");
        if (businessName == null) businessName = extractField(prompt, "business name:");
        if (category == null) category = extractField(prompt, "category:");

        // Simulating review replies based on rating and tone
        if (query.contains("review") && query.contains("reply")) {
            String reviewer = "Reviewer";
            if (query.contains("reviewer:")) {
                int idx = query.indexOf("reviewer:");
                int end = query.indexOf("\n", idx);
                if (end != -1) reviewer = query.substring(idx + 9, end).trim();
            }
            int rating = 5;
            if (query.contains("rating: 1")) rating = 1;
            else if (query.contains("rating: 2")) rating = 2;
            else if (query.contains("rating: 3")) rating = 3;
            else if (query.contains("rating: 4")) rating = 4;

            String tone = "professional";
            if (query.contains("friendly")) tone = "friendly";
            else if (query.contains("luxury")) tone = "luxury";
            else if (query.contains("healthcare")) tone = "healthcare";
            else if (query.contains("restaurant")) tone = "restaurant";

            return generateMockReply(reviewer, rating, tone, businessName, category);
        }

        // Simulating GMB post generations — NOW BUSINESS-AWARE
        if (query.contains("post") && (query.contains("type:") || query.contains("post type:"))) {
            String postType = "weekly";
            if (query.contains("weekly")) postType = "weekly";
            else if (query.contains("festival")) postType = "festival";
            else if (query.contains("promotion")) postType = "promotion";
            else if (query.contains("product")) postType = "product";

            return generateMockPost(postType, businessName, category);
        }

        // Simulating weekly report analysis
        if (query.contains("weekly report") || query.contains("performance summary")) {
            return generateMockWeeklyReport(businessName);
        }

        String biz = (businessName != null) ? businessName : "our business";
        return String.format("Thank you for choosing %s! We appreciate your business and feedback. If you have any questions, please don't hesitate to reach out.", biz);
    }

    /**
     * Extract a field value from the prompt text (e.g. "Business Name: Code Crafters 360")
     */
    private String extractField(String prompt, String fieldLabel) {
        int idx = prompt.indexOf(fieldLabel);
        if (idx == -1) return null;
        int start = idx + fieldLabel.length();
        int end = prompt.indexOf("\n", start);
        if (end == -1) end = prompt.length();
        String value = prompt.substring(start, end).trim();
        return value.isEmpty() ? null : value;
    }

    private String generateMockReply(String reviewer, int rating, String tone, String businessName, String category) {
        String biz = (businessName != null) ? businessName : "our business";
        String cat = (category != null) ? category.toLowerCase() : "business";

        if (rating >= 4) {
            switch (tone) {
                case "friendly":
                    return String.format("Hi %s! 😊 Thank you so much for the amazing review of %s! We're thrilled you had a great experience with us. Your support means the world to our team. Can't wait to see you again!", reviewer, biz);
                case "luxury":
                    return String.format("Dear %s, thank you for your gracious feedback about %s. We are delighted that your experience met our standards of excellence. We look forward to welcoming you back.", reviewer, biz);
                case "healthcare":
                    return String.format("Thank you for your kind words, %s. At %s, providing high-quality care is our top priority. We appreciate you trusting us with your health needs.", reviewer, biz);
                case "restaurant":
                    return String.format("Thanks for the review, %s! We're so glad you enjoyed your meal at %s. The chef will be happy to hear your feedback. Hope to cook for you again soon! 🍽️", reviewer, biz);
                case "professional":
                default:
                    return String.format("Dear %s, thank you for taking the time to review %s. We are delighted that you were satisfied with our %s services and look forward to serving you again.", reviewer, biz, cat);
            }
        } else {
            switch (tone) {
                case "friendly":
                    return String.format("Hi %s, I'm really sorry to hear your experience at %s wasn't great. We want to make this right — please reach out to us directly so we can help! 🙏", reviewer, biz);
                case "luxury":
                    return String.format("Dear %s, we sincerely regret that your experience at %s fell short of expectations. Please contact our team directly so we may investigate and restore your confidence in our services.", reviewer, biz);
                case "healthcare":
                    return String.format("Thank you for your feedback, %s. At %s, we take patient experiences seriously. Please reach out to our practice administrator directly so we can address your concerns.", reviewer, biz);
                case "restaurant":
                    return String.format("Hi %s, we apologize for the experience at %s. We strive for excellence and would love the chance to make it up to you. Please contact us directly — your next meal is on us! 🙏", reviewer, biz);
                case "professional":
                default:
                    return String.format("Dear %s, thank you for your feedback about %s. We apologize for not meeting your expectations and take this seriously. Please reach out to us directly so we can resolve this.", reviewer, biz);
            }
        }
    }

    private String generateMockPost(String postType, String businessName, String category) {
        String biz = (businessName != null) ? businessName : "our business";
        String cat = (category != null) ? category : "services";

        switch (postType) {
            case "festival":
                return String.format("🎉 Happy festivities from %s! 🌟 We hope your celebrations are filled with joy. We're incredibly grateful for your continued support and trust in our %s. Wishing you and your family all the best! 🙏 #%s #FestivalGreetings #Community",
                        biz, cat.toLowerCase(), biz.replaceAll("\\s+", ""));
            case "promotion":
                return String.format("🔥 EXCLUSIVE OFFER from %s! 🔥 For a limited time, enjoy special discounts on our %s. Whether you're a loyal customer or visiting for the first time, now is the perfect time! 👇 Contact us today to claim your offer. #%s #SpecialOffer #LocalBusiness",
                        biz, cat.toLowerCase(), biz.replaceAll("\\s+", ""));
            case "product":
                return String.format("✨ Exciting update from %s! ✨ We're proud to showcase our latest %s offerings — crafted with quality and designed to exceed your expectations. Visit us today to learn more! #%s #NewOfferings #QualityFirst",
                        biz, cat.toLowerCase(), biz.replaceAll("\\s+", ""));
            case "weekly":
            default:
                return String.format("👋 Happy new week from %s! We're open and ready to deliver the best %s experience. Our team is here to help — stop by, call us, or visit our website. See you soon! 💼 #%s #WeeklyUpdate #CustomerFirst",
                        biz, cat.toLowerCase(), biz.replaceAll("\\s+", ""));
        }
    }

    private String generateMockDescription(String businessName, String category) {
        String biz = (businessName != null) ? businessName : "our local business";
        String cat = (category != null) ? category : "professional services";
        return String.format(
            "Welcome to %s, the leading provider of high-quality %s. We are dedicated to delivering outstanding service, local expertise, and customer satisfaction in our community. Visit us or call today to discover why local residents trust %s for all their needs!",
            biz, cat, biz
        );
    }

    private String generateMockWeeklyReport(String businessName) {
        String biz = (businessName != null) ? businessName : "your business";
        return "{\n" +
                "  \"summary\": \"" + biz + " has experienced positive momentum this week. Total profile interactions are up by 12.4% with search visibility showing strong local authority.\",\n" +
                "  \"sentiment_analysis\": \"Review sentiment for " + biz + " remains highly positive (87% positive, 8% neutral, 5% negative). Customers consistently praise responsive service and quality.\",\n" +
                "  \"seo_recommendations\": \"1. Add more local service keywords specific to " + biz + " in post updates.\\n2. Complete the profile description for all locations.\\n3. Respond to all reviews within 24 hours to boost local search rankings.\",\n" +
                "  \"content_recommendations\": \"Share a product highlight post showcasing " + biz + "'s best offerings, and schedule a festival greetings post. Use high-quality local images.\",\n" +
                "  \"growth_opportunities\": \"Leverage the recent surge in Direction Requests by offering a weekend-starter discount or expanding active hours for " + biz + ".\"\n" +
                "}";
    }
}
