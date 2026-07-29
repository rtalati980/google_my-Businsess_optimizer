package com.gmb.manager.controller;

import com.gmb.manager.entity.Business;
import com.gmb.manager.entity.GoogleQuestion;
import com.gmb.manager.entity.Location;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.BusinessRepository;
import com.gmb.manager.repository.LocationRepository;
import com.gmb.manager.service.GoogleQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/locations/{locationId}/qa")
@RequiredArgsConstructor
public class GoogleQaController {

    private final GoogleQuestionService questionService;
    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    private boolean isOwner(Location location, User user) {
        Business biz = businessRepository.findById(location.getBusinessId()).orElse(null);
        return biz != null && biz.getUserId().equals(user.getId());
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Pageable pageable = PageRequest.of(page, size, Sort.by("askedAt").descending());
        Page<GoogleQuestion> questions = questionService.getLocationQuestionsPage(locationId, pageable);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/questions/unanswered")
    public ResponseEntity<?> getUnansweredQuestions(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Pageable pageable = PageRequest.of(page, size, Sort.by("askedAt").descending());
        Page<GoogleQuestion> questions = questionService.getUnansweredQuestionsPage(locationId, pageable);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/questions/{questionId}")
    public ResponseEntity<?> getQuestion(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String questionId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        GoogleQuestion question = questionService.getQuestion(questionId);
        return ResponseEntity.ok(question);
    }

    @PostMapping("/questions/{questionId}/answer")
    public ResponseEntity<?> answerQuestion(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String questionId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String answer = request.get("answer");
        if (answer == null || answer.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Answer cannot be empty"));
        }

        GoogleQuestion answered = questionService.answerQuestion(questionId, answer);
        return ResponseEntity.ok(answered);
    }

    @PostMapping("/questions/{questionId}/answer/draft")
    public ResponseEntity<?> saveDraftAnswer(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String questionId,
            @RequestBody Map<String, String> request
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        String answer = request.get("answer");
        GoogleQuestion draft = questionService.saveDraftAnswer(questionId, answer);
        return ResponseEntity.ok(draft);
    }

    @PostMapping("/questions/{questionId}/answer/publish")
    public ResponseEntity<?> publishAnswer(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String questionId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        try {
            GoogleQuestion published = questionService.publishAnswer(questionId);
            return ResponseEntity.ok(published);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId,
            @PathVariable String questionId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok(Map.of("message", "Question deleted"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getQaAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        Map<String, Object> analytics = questionService.getQaAnalytics(locationId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/unanswered/count")
    public ResponseEntity<?> getUnansweredCount(
            @AuthenticationPrincipal User user,
            @PathVariable String locationId
    ) {
        Location location = locationRepository.findById(locationId).orElse(null);
        if (location == null) return ResponseEntity.notFound().build();
        if (!isOwner(location, user)) return ResponseEntity.status(403).body("Access Denied");

        long count = questionService.getUnansweredCount(locationId);
        return ResponseEntity.ok(Map.of("unansweredCount", count));
    }
}
