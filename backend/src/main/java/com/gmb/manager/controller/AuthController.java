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
    private final com.gmb.manager.service.GmbService gmbService;
    private final org.springframework.security.oauth2.client.registration.ClientRegistrationRepository clientRegistrationRepository;
    private final org.springframework.security.oauth2.client.web.AuthorizationRequestRepository<org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest> authorizationRequestRepository =
            new org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository();

    @GetMapping("/google-login-url")
    public ResponseEntity<?> getGoogleLoginUrl(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response) {
        org.springframework.security.oauth2.client.registration.ClientRegistration clientRegistration =
                clientRegistrationRepository.findByRegistrationId("google");
        if (clientRegistration == null) {
            return ResponseEntity.status(500).body(Map.of("error", "Google client registration not found"));
        }
        
        org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver resolver =
                new org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");
        
        org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest authRequest =
                resolver.resolve(request, "google");
        
        if (authRequest == null) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not resolve Google OAuth2 request"));
        }
        
        // Save the request into the session so the state matches when Google redirects back
        authorizationRequestRepository.saveAuthorizationRequest(authRequest, request, response);
        
        // Return the Google OAuth authorization URL
        return ResponseEntity.ok(Map.of("url", authRequest.getAuthorizationRequestUri()));
    }


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
                    .planType("PREMIUM")
                    .status("TRIALING")
                    .currentPeriodEnd(LocalDateTime.now().plusDays(14))
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

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        gmbService.deleteUserAccount(user);
        return ResponseEntity.ok(Map.of("message", "Account successfully deleted in compliance with DPDP Act, 2023."));
    }
}
