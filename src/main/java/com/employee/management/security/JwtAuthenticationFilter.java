package com.employee.management.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;


    @Override
    protected boolean shouldNotFilter(
            @NonNull HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth/");
    }


    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader(HttpHeaders.AUTHORIZATION);


        // ==========================================
        // NO JWT TOKEN
        // ==========================================

        if (authHeader == null ||
                !authHeader.startsWith(BEARER_PREFIX)) {

            log.debug(
                    "No JWT token found for request: {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );

            filterChain.doFilter(request, response);
            return;
        }


        // ==========================================
        // EXTRACT JWT
        // ==========================================

        String jwt =
                authHeader.substring(BEARER_PREFIX.length());


        try {

            String username =
                    jwtService.extractUsername(jwt);


            // ==========================================
            // LOAD USER
            // ==========================================

            if (username != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);


                // ==========================================
                // DEBUG USER AUTHORITY
                // ==========================================

                log.info("======================================");
                log.info(
                        "JWT USER       : {}",
                        userDetails.getUsername()
                );
                log.info(
                        "JWT AUTHORITIES: {}",
                        userDetails.getAuthorities()
                );
                log.info(
                        "REQUEST        : {} {}",
                        request.getMethod(),
                        request.getRequestURI()
                );
                log.info("======================================");


                // ==========================================
                // VALIDATE TOKEN
                // ==========================================

                if (jwtService.isTokenValid(
                        jwt,
                        userDetails)) {


                    // ==========================================
                    // CREATE AUTHENTICATION
                    // ==========================================

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );


                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );


                    // ==========================================
                    // SET SECURITY CONTEXT
                    // ==========================================

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);


                    // ==========================================
                    // VERIFY SECURITY CONTEXT
                    // ==========================================

                    log.info(
                            "SECURITY CONTEXT AUTHORITIES: {}",
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
                                    .getAuthorities()
                    );

                    log.info(
                            "JWT authentication successful for: {}",
                            username
                    );

                } else {

                    log.warn(
                            "JWT validation failed for user: {}",
                            username
                    );
                }
            }


            // ==========================================
            // CONTINUE REQUEST
            // ==========================================

            filterChain.doFilter(request, response);


        } catch (Exception ex) {

            log.error(
                    "JWT Authentication Error: {}",
                    ex.getMessage(),
                    ex
            );

            sendUnauthorizedResponse(response);
        }
    }


    // ==========================================
    // UNAUTHORIZED RESPONSE
    // ==========================================

    private void sendUnauthorizedResponse(
            HttpServletResponse response)
            throws IOException {

        response.setStatus(
                HttpStatus.UNAUTHORIZED.value()
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );


        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "timestamp",
                LocalDateTime.now()
        );

        body.put(
                "status",
                HttpStatus.UNAUTHORIZED.value()
        );

        body.put(
                "error",
                "Unauthorized"
        );

        body.put(
                "message",
                "Invalid or Expired JWT Token"
        );


        objectMapper.writeValue(
                response.getOutputStream(),
                body
        );
    }
}