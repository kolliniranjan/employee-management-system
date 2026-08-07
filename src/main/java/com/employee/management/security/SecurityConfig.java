package com.employee.management.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    private static final String[] PUBLIC_ENDPOINTS = {
        "/api/auth/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/v3/api-docs/**",
        "/webjars/**"
};
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider)

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // Employee APIs
                        .requestMatchers(HttpMethod.GET,
                                "/api/employees/**")
                        .hasAnyRole("ADMIN", "EMPLOYEE")

                        .requestMatchers(HttpMethod.POST,
                                "/api/employees/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/employees/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/employees/**")
                        .hasRole("ADMIN")

                        // Department APIs
                        .requestMatchers(HttpMethod.GET,
                                "/api/departments/**")
                        .hasAnyRole("ADMIN", "EMPLOYEE")

                        .requestMatchers(HttpMethod.POST,
                                "/api/departments/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/departments/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/departments/**")
                        .hasRole("ADMIN")

                        // Everything else
                        .anyRequest()
                        .authenticated()

                );

        return http.build();

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;

    }

}