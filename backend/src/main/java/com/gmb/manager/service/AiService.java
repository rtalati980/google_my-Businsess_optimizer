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

    @Value("${app.anthropic.api-key:sk-ant-mock-key}")
    private String apiKey;

    @Value("${app.anthropic.api-url:https://api.anthropic.com/v1}")
    private String apiBaseUrl;

    @Value("${app.anthropic.model:claude-3-5-sonnet-20241022}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_TOKENS = 2048;

    /**
     * Generates content using Anthropic Claude API. If the API key is empty/mock or errors occur,
     * falls back to realistic mock content.
     */
    public String generateContent(String systemInstruction, String userPrompt) {
        if (apiKey == null || apiKey.startsWith("sk-ant-mock") || apiKey.trim().isEmpty()) {
            log.info("Using simulation mode for AI generation (no valid Anthropic API key configured)");
            return simulateResponse(systemInstruction, userPrompt);
        }

        try {
            String url = apiBaseUrl + "/messages";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            // Build Anthropic Messages API request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", MAX_TOKENS);

            // Add system instruction if provided
            if (systemInstruction != null && !systemInstruction.trim().isEmpty()) {
                requestBody.put("system", systemInstruction);
            }

            // Add user message
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", userPrompt);
            messages.add(message);
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Anthropic Claude API with model: {}", model);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode content = root.path("content");
                if (content.isArray() && !content.isEmpty()) {
                    String text = content.get(0).path("text").asText();
                    if (!text.isEmpty()) {
                        log.debug("Successfully generated content from Anthropic Claude");
                        return text;
                    }
                }
            }
            throw new RuntimeException("Unexpected response format from Anthropic API");
        } catch (Exception e) {
            log.error("Error calling Anthropic Claude API: {}. Falling back to simulated response.", e.getMessage(), e);
            return simulateResponse(systemInstruction, userPrompt);
        }
    }

    private String simulateResponse(String system, String prompt) {
        String query = prompt.toLowerCase();
        
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

            return generateMockReply(reviewer, rating, tone);
        }

        // Simulating GMB post generations
        if (query.contains("post") && query.contains("type:")) {
            String postType = "weekly";
            if (query.contains("weekly")) postType = "weekly";
            else if (query.contains("festival")) postType = "festival";
            else if (query.contains("promotion")) postType = "promotion";
            else if (query.contains("product")) postType = "product";
            
            return generateMockPost(postType);
        }

        // Simulating weekly report analysis
        if (query.contains("weekly report") || query.contains("performance summary")) {
            return generateMockWeeklyReport();
        }

        return "Thank you for contacting us! We appreciate your business and feedback. If you have any additional questions or concerns, please let us know.";
    }

    private String generateMockReply(String reviewer, int rating, String tone) {
        if (rating >= 4) {
            switch (tone) {
                case "friendly":
                    return "Hi " + reviewer + "! Thank you so much for the glowing review. We're thrilled to hear you had such a great experience. See you again soon!";
                case "luxury":
                    return "Dear " + reviewer + ", thank you for sharing your feedback. We are pleased that your experience met our standards of excellence. We look forward to welcoming you back in the future.";
                case "healthcare":
                    return "Thank you for your kind words, " + reviewer + ". Providing high-quality care is our top priority, and we appreciate you trusting us with your health needs.";
                case "restaurant":
                    return "Thanks for the review, " + reviewer + "! We're glad you enjoyed your meal. The chef will be happy to hear your feedback. Hope to cook for you again soon!";
                case "professional":
                default:
                    return "Dear " + reviewer + ", thank you for taking the time to leave a review. We are delighted that you were satisfied with our service and look forward to serving you again.";
            }
        } else {
            switch (tone) {
                case "friendly":
                    return "Hi " + reviewer + ", I'm really sorry to hear your experience wasn't great. We want to make this right. Please email us at support@gmbmanager.com so we can help!";
                case "luxury":
                    return "Dear " + reviewer + ", we regret to hear that your experience fell short of your expectations. Please contact our relations team directly so we may investigate this matter and restore your trust in our brand.";
                case "healthcare":
                    return "Thank you for your feedback, " + reviewer + ". We take patient experiences seriously. Due to privacy standards, please reach out to our practice administrator directly so we can discuss and address your concerns.";
                case "restaurant":
                    return "Hi " + reviewer + ", we apologize for the service/food issue. We strive for excellence and would love the chance to make it up to you. Please contact us directly for a free meal on us during your next visit.";
                case "professional":
                default:
                    return "Dear " + reviewer + ", thank you for your feedback. We apologize for not meeting your expectations. We take this seriously and will address it internally. Please reach out to us at admin@gmbmanager.com to discuss further.";
            }
        }
    }

    private String generateMockPost(String postType) {
        switch (postType) {
            case "festival":
                return "🎉 Wishing all our wonderful customers a Happy Holiday Season! 🌟\n\nWe hope your holidays are filled with joy, laughter, and quality time with loved ones. We are incredibly grateful for your support this year.\n\n🕒 Note: We will be closed on Christmas Day, but open normal hours otherwise. Stop by to see us!\n\n#HappyHolidays #CommunityLove #ShopLocal";
            case "promotion":
                return "🔥 SPECIAL OFFER: 15% OFF ALL SERVICES THIS WEEK! 🔥\n\nTo thank our local community, we're offering a 15% discount on everything from today until Sunday. Whether you're a returning client or visiting us for the first time, now is the perfect time to book.\n\n👇 Click 'Call Now' or visit our website to secure your slot!\n\n#SpecialOffer #Sale #LocalBusiness #SupportLocal";
            case "product":
                return "✨ Product Spotlight: Introducing our Premium Collection! ✨\n\nCrafted with high-quality ingredients and designed for maximum performance, our new lineup is officially in stock. \n\nStop by our location today to view the items in person and chat with our experts about finding the perfect fit for your needs.\n\n#ProductShowcase #NewArrivals #QualityFirst #LocalStore";
            case "weekly":
            default:
                return "👋 Happy Monday! We're open and ready to serve you all week long. 💼\n\nAt our business, customer satisfaction is our top priority. Stop in today to explore our services or give us a call to find out how we can help you.\n\n📍 Find us at our main location. See you soon!\n\n#MondayMotivation #LocalServices #CustomerFirst";
        }
    }

    private String generateMockWeeklyReport() {
        return "{\n" +
                "  \"summary\": \"Overall business metrics have experienced positive momentum this week. Total profile interactions are up by 12.4% with search visibility showing strong local authority.\",\n" +
                "  \"sentiment_analysis\": \"Review sentiment remains highly positive (87% positive, 8% neutral, 5% negative). Customers consistently praise responsive customer service and product quality, though a few negative reviews cited wait times.\",\n" +
                "  \"seo_recommendations\": \"1. Add more local service keywords (e.g., 'same-day service near me') in post updates.\\n2. Complete the profile description for all satellite locations.\\n3. Respond to all reviews within 24 hours to boost local search rankings.\",\n" +
                "  \"content_recommendations\": \"Share a product highlight post showcasing customer favorite items, and schedule a festival/holiday greetings post. Use high-quality local images where possible.\",\n" +
                "  \"growth_opportunities\": \"Leverage the recent surge in 'Direction Requests' on Friday evenings by offering a weekend-starter discount or expanding active hours.\"\n" +
                "}";
    }
}
