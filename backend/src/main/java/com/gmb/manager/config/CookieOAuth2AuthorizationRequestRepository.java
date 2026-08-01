package com.gmb.manager.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Arrays;
import java.util.Optional;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/**
 * Stores the OAuth2 authorization request (including the state parameter)
 * in a compressed short-lived browser cookie instead of the HTTP session.
 *
 * GZIP compression ensures the cookie remains well under browser size limits (4KB).
 * ResponseCookie ensures clean SameSite=None; Secure header emission.
 */
@Component
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_REQUEST_COOKIE = "oauth2_auth_req";
    private static final int COOKIE_EXPIRE_SECONDS = 300; // 5 minutes

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
        if (serialized != null) {
            ResponseCookie cookie = ResponseCookie.from(OAUTH2_REQUEST_COOKIE, serialized)
                    .path("/")
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .maxAge(COOKIE_EXPIRE_SECONDS)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
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
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String serialize(OAuth2AuthorizationRequest request) {
        try {
            byte[] bytes = SerializationUtils.serialize(request);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (GZIPOutputStream gzos = new GZIPOutputStream(baos)) {
                gzos.write(bytes);
            }
            return Base64.getUrlEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            try {
                return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(request));
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(value);
            try (GZIPInputStream gzis = new GZIPInputStream(new ByteArrayInputStream(decoded))) {
                byte[] uncompressed = gzis.readAllBytes();
                return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(uncompressed);
            } catch (Exception e) {
                // Fallback for uncompressed cookies
                return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(decoded);
            }
        } catch (Exception e) {
            return null;
        }
    }
}
