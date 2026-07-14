package com.gmb.manager.config;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.SubscriptionRepository;
import com.gmb.manager.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String avatarUrl = oAuth2User.getAttribute("picture");
            String googleSub = oAuth2User.getAttribute("sub");

            if (email == null) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found from OAuth provider");
                return;
            }

            // Extract Google OAuth2 access token + refresh token for Business Profile API calls
            String accessToken = null;
            String refreshToken = null;
            try {
                OAuth2AuthorizedClient authorizedClient = authorizedClientService
                        .loadAuthorizedClient("google", authentication.getName());
                if (authorizedClient != null && authorizedClient.getAccessToken() != null) {
                    accessToken = authorizedClient.getAccessToken().getTokenValue();
                }
                if (authorizedClient != null && authorizedClient.getRefreshToken() != null) {
                    refreshToken = authorizedClient.getRefreshToken().getTokenValue();
                }
            } catch (Exception e) {
                // Non-fatal: token extraction failed
            }

            // Register or retrieve user
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Update profile info
                user.setName(name);
                user.setAvatarUrl(avatarUrl);
                user.setGoogleSub(googleSub);
                if (accessToken != null) {
                    user.setGoogleAccessToken(accessToken);
                }
                if (refreshToken != null) {
                    user.setGoogleRefreshToken(refreshToken);
                }
                user.setUpdatedAt(LocalDateTime.now());
                user = userRepository.save(user);

            } else {
                user = User.builder()
                        .email(email)
                        .name(name)
                        .avatarUrl(avatarUrl)
                        .googleSub(googleSub)
                        .googleAccessToken(accessToken)
                        .googleRefreshToken(refreshToken)
                        .role("ROLE_CLIENT")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                user = userRepository.save(user);

                // Create default subscription status (14-day premium free trial)
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

            // Generate JWT
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole());
            claims.put("name", user.getName());
            String token = jwtService.generateToken(user.getEmail(), claims);

            // Redirect back to Next.js
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/callback")
                    .queryParam("token", token)
                    .build()
                    .toUriString();

            System.out.println("[OAuth2SuccessHandler] Frontend URL: " + frontendUrl);
            System.out.println("[OAuth2SuccessHandler] Redirect URL: " + targetUrl);

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            System.err.println("[OAuth2SuccessHandler] Error during authentication success handling:");
            e.printStackTrace();
            throw new ServletException("Authentication success processing failed", e);
        }
    }
}
