package com.gmb.manager.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import java.util.Base64;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

/**
 * Stores the OAuth2 authorization request (including the state parameter)
 * in a short-lived browser cookie instead of the HTTP session.
 *
 * This is required for Cloud Run (and any stateless/multi-instance deployment)
 * because the HTTP session on instance A is not available on instance B.
 * When Google redirects back after login, it may hit a different instance —
 * which would cause a state-mismatch 400 if session-based storage is used.
 */
@Component
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_REQUEST_COOKIE = "oauth2_auth_req";
    private static final int COOKIE_EXPIRE_SECONDS = 300; // 5 minutes — enough for the OAuth2 round-trip

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request, OAUTH2_REQUEST_COOKIE)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        if (authorizationRequest == null) {
            deleteCookie(request, response, OAUTH2_REQUEST_COOKIE);
            return;
        }

        String serialized = serialize(authorizationRequest);
        Cookie cookie = new Cookie(OAUTH2_REQUEST_COOKIE, serialized);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
        // SameSite=None + Secure is required for cross-site redirects (Google → backend)
        // We set this via the response header to support older servlet containers
        response.addCookie(cookie);
        // Override with SameSite=None; Secure for cross-site OAuth2 redirect support
        String cookieHeader = String.format(
                "%s=%s; Path=/; HttpOnly; Max-Age=%d; SameSite=None; Secure",
                OAUTH2_REQUEST_COOKIE, serialized, COOKIE_EXPIRE_SECONDS
        );
        response.addHeader("Set-Cookie", cookieHeader);
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        if (authorizationRequest != null) {
            deleteCookie(request, response, OAUTH2_REQUEST_COOKIE);
        }
        return authorizationRequest;
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return;
        Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .forEach(c -> {
                    c.setValue("");
                    c.setPath("/");
                    c.setMaxAge(0);
                    response.addCookie(c);
                });
    }

    private String serialize(OAuth2AuthorizationRequest request) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(request));
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(bytes);
        } catch (Exception e) {
            return null;
        }
    }
}
