package com.gmb.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gmb.manager.entity.AIReport;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.Review;
import com.gmb.manager.repository.AIReportRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final AIReportRepository reportRepository;
    private final LocationRepository locationRepository;
    private final ReviewRepository reviewRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<AIReport> getReports(String locationId) {
        return reportRepository.findByLocationIdOrderByCreatedAtDesc(locationId);
    }

    public Optional<AIReport> getReportById(String reportId) {
        return reportRepository.findById(reportId);
    }

    public AIReport generateWeeklyReport(String locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));

        List<Review> reviews = reviewRepository.findByLocationId(locationId);

        StringBuilder reviewsText = new StringBuilder();
        if (reviews.isEmpty()) {
            reviewsText.append("No new reviews have been received this week.");
        } else {
            for (Review r : reviews) {
                reviewsText.append(String.format("- %s rated %d stars: \"%s\"\n",
                        r.getReviewerName(), r.getRating(),
                        r.getComment() != null ? r.getComment() : "No text"));
            }
        }

        String systemInstruction = "You are GMB AI Manager, a senior local SEO consultant and business analyst. " +
                "You must analyze a business's local reviews and metrics and write a weekly performance report. " +
                "You MUST output raw JSON matching the requested structure precisely. Do not include markdown code block syntax (like ```json).";

        String prompt = String.format(
                "Generate a Weekly Performance Report for this business location.\n" +
                "Business Name: %s\n" +
                "Category: %s\n" +
                "Address: %s\n\n" +
                "Here are the reviews received recently:\n%s\n\n" +
                "Format your response as a valid JSON object with the following keys:\n" +
                "- \"summary\": A high-level overview of the weekly performance.\n" +
                "- \"sentiment_analysis\": Breakdown of positive/negative reviewer sentiments.\n" +
                "- \"seo_recommendations\": 3 concrete recommendations to boost local SEO.\n" +
                "- \"content_recommendations\": Social media posting ideas for GMB.\n" +
                "- \"growth_opportunities\": Business growth actions based on feedback.\n\n" +
                "Remember: Return ONLY the raw JSON object.",
                location.getName(),
                location.getCategory(),
                location.getAddress(),
                reviewsText.toString()
        );

        String generatedJson = aiService.generateContent(systemInstruction, prompt);

        if (generatedJson.contains("```")) {
            generatedJson = generatedJson.replaceAll("```json", "")
                                         .replaceAll("```", "")
                                         .trim();
        }

        String summary = "";
        String sentiment = "";
        String seo = "";
        String content = "";
        String growth = "";

        try {
            JsonNode root = objectMapper.readTree(generatedJson);
            summary = root.path("summary").asText();
            sentiment = root.path("sentiment_analysis").asText();
            seo = root.path("seo_recommendations").asText();
            content = root.path("content_recommendations").asText();
            growth = root.path("growth_opportunities").asText();
        } catch (Exception e) {
            log.error("Failed to parse AI JSON response: {}. Saving response as raw summary.", e.getMessage());
            summary = generatedJson;
            sentiment = "Please see summary.";
            seo = "1. Maintain consistent posts.\n2. Respond quickly to reviews.\n3. Keep profile categories optimized.";
            content = "Publish a general client-appreciation post.";
            growth = "Respond to client criticisms mentioned in recent reviews.";
        }

        AIReport report = AIReport.builder()
                .locationId(locationId)
                .startDate(LocalDate.now().minusDays(7))
                .endDate(LocalDate.now())
                .summary(summary)
                .sentimentAnalysis(sentiment)
                .seoRecommendations(seo)
                .contentRecommendations(content)
                .growthOpportunities(growth)
                .createdAt(LocalDateTime.now())
                .build();

        return reportRepository.save(report);
    }
}
