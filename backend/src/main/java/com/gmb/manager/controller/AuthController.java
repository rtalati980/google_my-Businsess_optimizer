package com.gmb.manager.controller;

import com.gmb.manager.config.JwtService;
import com.gmb.manager.entity.Subscription;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.SubscriptionRepository;
import com.gmb.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final JwtService jwtService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/mock-login")
    public ResponseEntity<?> mockLogin() {
        String email = "sandbox@gmbmanager.com";
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = User.builder()
                    .email(email)
                    .name("Sandbox Owner")
                    .avatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150")
                    .googleSub("google_sub_sandbox_12345")
                    .role("ROLE_CLIENT")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);

            Subscription subscription = Subscription.builder()
                    .userId(user.getId())
                    .planType("BASIC")
                    .status("ACTIVE")
                    .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            subscriptionRepository.save(subscription);
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("name", user.getName());
        String token = jwtService.generateToken(user.getEmail(), claims);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.ok(response);
    }
}
