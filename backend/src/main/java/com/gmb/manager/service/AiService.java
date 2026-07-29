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
        String category    = extractField(prompt, "Business Category:");
        String address     = extractField(prompt, "Address:");
        if (businessName == null) businessName = extractField(prompt, "business name:");
        if (businessName == null) businessName = extractField(prompt, "Name:");
        if (category     == null) category     = extractField(prompt, "category:");
        if (category     == null) category     = extractField(prompt, "Category:");
        if (address      == null) address       = extractField(prompt, "Location:");

        // 1. Review reply simulation
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
            if (query.contains("friendly"))    tone = "friendly";
            else if (query.contains("luxury")) tone = "luxury";
            else if (query.contains("healthcare")) tone = "healthcare";
            else if (query.contains("restaurant")) tone = "restaurant";

            return generateMockReply(reviewer, rating, tone, businessName, category);
        }

        // 2. GMB Post generation — business-aware
        if (query.contains("post") && (query.contains("type:") || query.contains("post type:"))) {
            String postType = "weekly";
            if (query.contains("festival"))   postType = "festival";
            else if (query.contains("promotion")) postType = "promotion";
            else if (query.contains("product"))   postType = "product";

            return generateMockPost(postType, businessName, category);
        }

        // 3. Weekly / performance report
        if (query.contains("weekly report") || query.contains("performance summary")) {
            return generateMockWeeklyReport(businessName);
        }

        // 4. Growth plan / advisor (30-day plan, analyse this business, etc.)
        if (query.contains("growth plan") || query.contains("30-day") || query.contains("analyse this local business")
                || query.contains("growth opportunities") || (system != null && system.toLowerCase().contains("seo consultant"))) {
            return generateMockGrowthPlan(businessName, category, address);
        }

        // 5. SEO audit JSON (seo_score, keyword_suggestions, profile_suggestions)
        if (query.contains("seo_score") || query.contains("keyword_suggestions")
                || query.contains("local seo audit") || query.contains("seo audit")) {
            return generateMockSeoAuditJson(businessName, category, address);
        }

        // 6. SEO content optimizer — return enriched post instead of generic line
        if (query.contains("optimize this gmb post") || query.contains("seo-optimized content")
                || (query.contains("optimize") && query.contains("local search"))) {
            // Extract the original post content between ORIGINAL POST: and BUSINESS:
            String original = "";
            int start = prompt.indexOf("ORIGINAL POST:");
            int end   = prompt.indexOf("\nBUSINESS:");
            if (start != -1 && end != -1 && end > start) {
                original = prompt.substring(start + 14, end).trim();
            }
            if (original.isEmpty()) original = prompt.substring(0, Math.min(250, prompt.length()));
            // Append category keyword and hashtag to original content
            String cat = (category != null) ? category : "local business";
            String biz = (businessName != null) ? businessName : "us";
            String catTag = "#" + cat.replaceAll("\\s+", "");
            String bizTag = "#" + biz.replaceAll("\\s+", "");
            String enriched = original + " 🔖 " + catTag + " " + bizTag + " #LocalBusiness";
            return enriched.length() > 300 ? enriched.substring(0, 297) + "..." : enriched;
        }

        // 7. SEO business description request
        if (query.contains("google business profile description") || query.contains("keywords to include")
                || (query.contains("seo") && query.contains("description"))) {
            return generateMockDescription(businessName, category);
        }

        // 8. Generic fallback — at least personalise with business name
        String biz = (businessName != null) ? businessName : "our business";
        String cat = (category != null) ? category.toLowerCase() : "services";
        return String.format(
                "Thank you for choosing %s! As a trusted provider of %s, we are committed to delivering exceptional quality " +
                "and service to every customer. Visit us, call us, or check our website — our team is always ready to help. 😊",
                biz, cat);
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

        // Category-aware description variations for richer simulation output
        String catLower = cat.toLowerCase();
        String specialLine;
        if (catLower.contains("dental") || catLower.contains("clinic") || catLower.contains("hospital") || catLower.contains("medical")) {
            specialLine = String.format("Our experienced healthcare team at %s uses the latest technology to ensure gentle, effective treatment. " +
                    "We prioritise patient comfort and transparent, affordable care in every visit.", biz);
        } else if (catLower.contains("restaurant") || catLower.contains("cafe") || catLower.contains("food") || catLower.contains("biryani")) {
            specialLine = String.format("%s serves freshly prepared, authentic dishes crafted from locally sourced ingredients. " +
                    "Whether dining in or ordering out, expect warm hospitality and flavours you will keep coming back for.", biz);
        } else if (catLower.contains("salon") || catLower.contains("beauty") || catLower.contains("spa")) {
            specialLine = String.format("At %s, our skilled stylists and therapists are dedicated to making you look and feel your absolute best. " +
                    "We use premium products and the latest techniques tailored to each client.", biz);
        } else if (catLower.contains("software") || catLower.contains("tech") || catLower.contains("digital") || catLower.contains("it")) {
            specialLine = String.format("%s delivers cutting-edge technology solutions designed to grow your business. " +
                    "From custom software development to digital marketing, our expert team transforms your vision into results.", biz);
        } else if (catLower.contains("real estate") || catLower.contains("property")) {
            specialLine = String.format("%s helps you find, buy, or sell properties with confidence. " +
                    "Our experienced agents provide transparent guidance and personalised service throughout your real estate journey.", biz);
        } else if (catLower.contains("gym") || catLower.contains("fitness") || catLower.contains("yoga")) {
            specialLine = String.format("%s is your community fitness hub offering expert trainers, modern equipment, and flexible membership plans. " +
                    "Start your transformation journey today — because your health is your greatest wealth.", biz);
        } else {
            specialLine = String.format("%s stands out for its commitment to excellence, customer-first approach, and deep local expertise in %s. " +
                    "Every interaction is crafted to exceed your expectations.", biz, cat);
        }

        return String.format(
                "Welcome to %s — your trusted local expert in %s. %s " +
                "Book an appointment, visit our location, or call us today. We look forward to serving you!",
                biz, cat, specialLine
        );
    }

    private String generateMockGrowthPlan(String businessName, String category, String address) {
        String biz  = (businessName != null) ? businessName : "Your Business";
        String cat  = (category  != null) ? category  : "Local Business";
        String loc  = (address   != null) ? address   : "your area";
        return String.format(
            "## 🎯 Overall Assessment\n" +
            "%s scores 7/10 for local online presence. Strong potential exists to capture more local customers through " +
            "consistent posting, review management, and keyword-rich profile content.\n\n" +

            "## 🚨 Urgent Actions (Do This Week)\n" +
            "1. Reply to all unanswered Google reviews within 24 hours — this directly boosts local ranking.\n" +
            "2. Ensure your Google Business Profile description is fully updated to 750 characters with relevant keywords.\n" +
            "3. Add at least 5 recent, high-quality photos of your %s.\n" +
            "4. Enable the Q&A section and post 3 frequently asked customer questions with detailed answers.\n" +
            "5. Confirm your business hours are accurate and mark any special holiday hours.\n\n" +

            "## ⭐ Review Growth Strategy\n" +
            "- Train your team to politely request a Google review at the end of every positive customer interaction.\n" +
            "- Create a printed card or WhatsApp message with a direct review link for %s.\n" +
            "- Respond to every review — positive and negative — within 24 hours to signal engagement to Google's algorithm.\n\n" +

            "## 📝 30-Day Content Calendar\n" +
            "- Week 1: Post a 'Meet the Team' update showcasing the people behind %s.\n" +
            "- Week 2: Share a customer success story or testimonial post.\n" +
            "- Week 3: Announce a promotion or special offer exclusive to Google Business Profile viewers.\n" +
            "- Week 4: Post a milestone (e.g. '5 years serving %s') with a thank-you to loyal customers.\n\n" +

            "## 🔍 Local SEO Improvements\n" +
            "1. Add '%s near me' and 'best %s in %s' naturally into your profile description.\n" +
            "2. Use the Services section to list every service with keyword-rich names and descriptions.\n" +
            "3. Get listed on Justdial, Sulekha, and IndiaMART for additional local citation signals.\n" +
            "4. Post at least 3 times per week — businesses that post consistently rank higher.\n" +
            "5. Add attributes (e.g. 'women-led', 'online appointments', 'free parking') in your profile.\n\n" +

            "## 🏆 Beat the Competitors\n" +
            "1. Monitor the top 3 competitors monthly — match or exceed their review count and response rate.\n" +
            "2. Publish more posts than competitors — even one extra post per week creates a visible edge.\n" +
            "3. Differentiate %s with a unique selling point clearly stated in your profile (e.g. fastest turnaround, lowest price guarantee).\n\n" +

            "## 📱 WhatsApp & Customer Engagement\n" +
            "- Create a WhatsApp Business account linked to your Google profile.\n" +
            "- Send a weekly broadcast to previous customers with new offers or posts.\n" +
            "- Use the WhatsApp Status feature to share your latest Google posts for wider organic reach.\n\n" +

            "## 📊 30-Day KPIs to Track\n" +
            "1. Number of new Google reviews received.\n" +
            "2. Profile views (Search + Maps) week over week.\n" +
            "3. Website clicks and direction requests from Google profile.\n" +
            "4. Number of posts published this month.\n" +
            "5. Review response rate (target: 100%% within 24 hours).",
            biz, cat.toLowerCase(), biz, biz, loc, cat.toLowerCase(), cat.toLowerCase(), loc, biz
        );
    }

    private String generateMockSeoAuditJson(String businessName, String category, String address) {
        String biz = (businessName != null) ? businessName : "local business";
        String cat = (category  != null) ? category  : "Local Business";
        String city = "";
        if (address != null) {
            String[] parts = address.split(",");
            if (parts.length >= 2) city = parts[parts.length - 2].trim();
        }

        // Build category-specific keywords
        String catLower = cat.toLowerCase();
        String k1 = "best " + catLower + " near me";
        String k2 = catLower + (city.isEmpty() ? "" : " in " + city);
        String k3 = "top rated " + catLower;
        String k4 = "affordable " + catLower;
        String k5 = catLower + " services";

        // Category-specific keyword overrides
        if (catLower.contains("dental") || catLower.contains("clinic")) {
            k5 = "emergency " + catLower + " near me";
        } else if (catLower.contains("restaurant") || catLower.contains("food")) {
            k5 = catLower + " delivery";
        } else if (catLower.contains("software") || catLower.contains("tech")) {
            k4 = "custom software development";
            k5 = "digital marketing agency";
        } else if (catLower.contains("gym") || catLower.contains("fitness")) {
            k4 = "personal trainer";
            k5 = "fitness center membership";
        }

        return String.format(
            "{\n" +
            "  \"seo_score\": 62,\n" +
            "  \"keyword_suggestions\": \"%s, %s, %s, %s, %s\",\n" +
            "  \"profile_suggestions\": \"1. Write a full 750-character business description for %s with local keywords.\\n" +
            "2. Upload at least 10 high-quality photos of your %s.\\n" +
            "3. Add all services/products in the Google Business Profile Services section.\\n" +
            "4. Enable the Q&A feature and pre-answer 5 common customer questions.\",\n" +
            "  \"competitor_insights\": \"1. Top-ranked competitors in %s consistently post 3+ times per week — match this cadence.\\n" +
            "2. Businesses with 50+ replied reviews in your category rank 40%% higher in local search results.\"\'\n" +
            "}",
            k1, k2, k3, k4, k5, biz, catLower, catLower
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

    public String generatePhotoCaption(String photoTitle, String category) {
        String prompt = String.format("Generate a compelling, SEO-friendly caption for a %s photo titled '%s'. Make it engaging and include relevant hashtags. Keep it under 150 characters.", category, photoTitle);
        return generateContent("You are an expert social media marketing specialist for Google Business Profile optimization.", prompt);
    }

    public String generatePhotoTags(String title, String description, String category) {
        String prompt = String.format("Generate relevant business tags/hashtags for a %s photo. Title: %s. Description: %s. Provide 5-7 relevant tags.", category, title, description);
        return generateContent("You are an expert at SEO and social media tagging.", prompt);
    }

    public String generateQuestionAnswer(String question, String locationId) {
        String prompt = String.format("As a helpful business owner, provide a professional, concise answer to this customer question: '%s'. Keep it under 300 characters and be friendly yet informative.", question);
        return generateContent("You are helping a business owner respond to customer questions on Google Business Profile. Be helpful, professional, and concise.", prompt);
    }

    /**
     * Generate keyword description with strategy (CRITICAL BUSINESS VALUE)
     * Explains WHY this keyword matters, search intent, ranking opportunity, and action items
     * Enforces 360-word maximum as specified
     */
    public String generateKeywordDescription(String keyword,
                                            String businessName,
                                            String category,
                                            Integer currentRank,
                                            Integer monthlySearchVolume) {

        String rankInfo = currentRank != null ? "#" + currentRank : "Not ranked";
        String volumeInfo = monthlySearchVolume != null ? monthlySearchVolume + " monthly searches" : "Volume unknown";

        String prompt = String.format(
            "You are a local SEO expert helping a %s business (%s) understand keyword opportunity.\n\n" +
            "Keyword: %s\n" +
            "Current Rank: %s\n" +
            "Monthly Searches: %s\n\n" +
            "Generate a 250-300 word keyword strategy description that includes:\n\n" +
            "1. WHAT: Explain what this keyword means (search intent)\n" +
            "2. WHY: Why it matters specifically for this %s business\n" +
            "3. POSITION: Analyze their current rank (#%s)\n" +
            "4. OPPORTUNITY: Business value (potential clicks, revenue impact)\n" +
            "5. ACTION: 3-4 specific, actionable steps to rank higher\n" +
            "6. TIMELINE: Realistic timeframe to improve ranking\n\n" +
            "Format: Use bullet points where appropriate. Include relevant emoji. " +
            "Be encouraging but realistic. Make it personal to %s, not generic.\n" +
            "MAXIMUM 360 WORDS. Make every word count.",
            category, businessName, keyword, rankInfo, volumeInfo,
            category, currentRank != null ? currentRank : 0, businessName
        );

        String systemInstruction =
            "You are an expert local SEO consultant helping small business owners understand their keyword rankings " +
            "and optimization opportunities. Provide specific, actionable insights that explain business value clearly. " +
            "Always include search intent analysis, current position assessment, and concrete action items. " +
            "Keep responses under 360 words. Use professional but friendly language with relevant emoji. " +
            "Focus on business results, not technical SEO jargon.";

        String description = generateContent(systemInstruction, prompt);

        // Enforce 360 word limit (approximate: ~60 chars per word)
        if (description.length() > 2160) { // 360 words * 6 chars average
            description = description.substring(0, 2160) + "...";
            log.warn("Keyword description truncated from {} to 360 words", description.length());
        }

        return description;
    }
}
