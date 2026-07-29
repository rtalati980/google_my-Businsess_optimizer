package com.gmb.manager.service;

import com.gmb.manager.entity.GoogleQuestion;
import com.gmb.manager.repository.GoogleQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleQuestionService {

    private final GoogleQuestionRepository questionRepository;
    private final AiService aiService;

    public GoogleQuestion createQuestion(String locationId, String googleQuestionId, String question, String author, String authorPhoto) {
        GoogleQuestion q = GoogleQuestion.builder()
                .locationId(locationId)
                .googleQuestionId(googleQuestionId)
                .question(question)
                .author(author)
                .authorPhoto(authorPhoto)
                .askedAt(LocalDateTime.now())
                .isAnswered(false)
                .answerStatus("PENDING")
                .upvotes(0)
                .downvotes(0)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        GoogleQuestion saved = questionRepository.save(q);
        generateAiAnswer(saved);
        return saved;
    }

    public void generateAiAnswer(GoogleQuestion question) {
        try {
            String aiAnswer = aiService.generateQuestionAnswer(question.getQuestion(), question.getLocationId());
            question.setAiSuggestedAnswer(aiAnswer);
            question.setAiConfidence("HIGH");
            categorizeQuestion(question);
            questionRepository.save(question);
        } catch (Exception e) {
            // Non-fatal
        }
    }

    private void categorizeQuestion(GoogleQuestion question) {
        String q = question.getQuestion().toLowerCase();
        if (q.contains("price") || q.contains("cost") || q.contains("pay")) {
            question.setQuestionCategory("PRICE");
        } else if (q.contains("hour") || q.contains("open") || q.contains("close")) {
            question.setQuestionCategory("LOCATION");
        } else if (q.contains("how") || q.contains("do you")) {
            question.setQuestionCategory("SERVICE");
        } else {
            question.setQuestionCategory("OTHER");
        }
    }

    public GoogleQuestion answerQuestion(String questionId, String answer) {
        GoogleQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        question.setAnswer(answer);
        question.setAnswerStatus("PUBLISHED");
        question.setIsAnswered(true);
        question.setAnsweredAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        return questionRepository.save(question);
    }

    public GoogleQuestion saveDraftAnswer(String questionId, String answer) {
        GoogleQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        question.setAnswer(answer);
        question.setAnswerStatus("DRAFT");
        question.setUpdatedAt(LocalDateTime.now());
        return questionRepository.save(question);
    }

    public GoogleQuestion publishAnswer(String questionId) {
        GoogleQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        if (question.getAnswer() == null || question.getAnswer().isEmpty()) {
            throw new IllegalArgumentException("Answer is required to publish");
        }
        question.setAnswerStatus("PUBLISHED");
        question.setIsAnswered(true);
        question.setAnsweredAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        return questionRepository.save(question);
    }

    public List<GoogleQuestion> getLocationQuestions(String locationId) {
        return questionRepository.findByLocationId(locationId);
    }

    public Page<GoogleQuestion> getLocationQuestionsPage(String locationId, Pageable pageable) {
        return questionRepository.findByLocationId(locationId, pageable);
    }

    public List<GoogleQuestion> getUnansweredQuestions(String locationId) {
        return questionRepository.findByLocationIdAndIsAnsweredIsFalse(locationId);
    }

    public Page<GoogleQuestion> getUnansweredQuestionsPage(String locationId, Pageable pageable) {
        return questionRepository.findByLocationIdAndIsAnsweredIsFalse(locationId, pageable);
    }

    public long getUnansweredCount(String locationId) {
        return questionRepository.countByLocationIdAndIsAnsweredIsFalse(locationId);
    }

    public GoogleQuestion getQuestion(String questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
    }

    public void deleteQuestion(String questionId) {
        questionRepository.deleteById(questionId);
    }

    public Map<String, Object> getQaAnalytics(String locationId) {
        List<GoogleQuestion> allQuestions = getLocationQuestions(locationId);
        long unanswered = getUnansweredCount(locationId);
        long answered = allQuestions.size() - unanswered;

        return Map.of(
                "totalQuestions", allQuestions.size(),
                "answeredQuestions", answered,
                "unansweredQuestions", unanswered,
                "answerRate", allQuestions.size() > 0 ? (answered * 100.0 / allQuestions.size()) : 0,
                "avgUpvotes", allQuestions.stream().mapToInt(GoogleQuestion::getUpvotes).average().orElse(0),
                "categoryDistribution", categoryDistribution(allQuestions)
        );
    }

    private Map<String, Long> categoryDistribution(List<GoogleQuestion> questions) {
        return questions.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        q -> q.getQuestionCategory() != null ? q.getQuestionCategory() : "OTHER",
                        java.util.stream.Collectors.counting()
                ));
    }
}
