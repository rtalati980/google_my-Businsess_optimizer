package com.gmb.manager.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Stores the OAuth2 authorization request indexed by its unique 'state' parameter.
 *
 * Since Google passes the 'state' parameter back in the query string on redirect
 * (?code=...&state=...), looking up by state bypasses all browser cookie restrictions,
 * SameSite policies, and cookie size limits completely.
 */
@Component
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final Map<String, StoredRequest> REQUEST_CACHE = new ConcurrentHashMap<>();
    private static final long EXPIRE_SECONDS = 600; // 10 minutes

    private static class StoredRequest {
        final OAuth2AuthorizationRequest request;
        final long createdAt;

        StoredRequest(OAuth2AuthorizationRequest request) {
            this.request = request;
            this.createdAt = Instant.now().getEpochSecond();
        }

        boolean isExpired() {
            return (Instant.now().getEpochSecond() - createdAt) > EXPIRE_SECONDS;
        }
    }

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        cleanup();
        String state = request.getParameter("state");
        if (state == null || state.isBlank()) {
            System.out.println("[OAuthStateRepo] State parameter missing in callback request");
            return null;
        }
        StoredRequest stored = REQUEST_CACHE.get(state);
        if (stored == null || stored.isExpired()) {
            System.out.println("[OAuthStateRepo] Authorization request not found or expired for state: " + state);
            return null;
        }
        System.out.println("[OAuthStateRepo] Successfully loaded authorization request for state: " + state);
        return stored.request;
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        cleanup();
        if (authorizationRequest == null) {
            String state = request.getParameter("state");
            if (state != null) {
                REQUEST_CACHE.remove(state);
            }
            return;
        }

        String state = authorizationRequest.getState();
        if (state != null) {
            REQUEST_CACHE.put(state, new StoredRequest(authorizationRequest));
            System.out.println("[OAuthStateRepo] Saved authorization request in memory store for state: " + state);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        String state = request.getParameter("state");
        if (state != null) {
            REQUEST_CACHE.remove(state);
        }
        return authorizationRequest;
    }

    private void cleanup() {
        REQUEST_CACHE.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
