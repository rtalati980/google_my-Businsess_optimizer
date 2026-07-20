package com.gmb.manager.config;

import com.gmb.manager.entity.User;
import com.gmb.manager.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("[JWT Filter] Missing or invalid Authorization header for URI: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        System.out.println("[JWT Filter] Token received for URI " + request.getRequestURI() + ": " + jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
        try {
            userEmail = jwtService.extractEmail(jwt);
            System.out.println("[JWT Filter] Extracted email: " + userEmail);
        } catch (Exception e) {
            System.out.println("[JWT Filter] Email extraction failed: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            System.out.println("[JWT Filter] User lookup in database found: " + userOpt.isPresent());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                boolean valid = jwtService.isTokenValid(jwt, user.getEmail());
                System.out.println("[JWT Filter] Token validation check against DB email: " + valid);
                if (valid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("[JWT Filter] Authentication successfully set in SecurityContext");
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
