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


    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    private static final String[] PUBLIC_ENDPOINTS = {

            // Authentication
            "/api/auth/register",
            "/api/auth/login",

            // Frontend pages
            "/",
            "/login.html",
            "/register.html",
            "/dashboard.html",
            "/employees.html",
            "/departments.html",
            "/profile.html",
            "/organization-application.html",
            "/applications.html",

            // Frontend resources
            "/css/**",
            "/js/**",
            "/images/**",
            "/favicon.ico",

            // Swagger
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/webjars/**"
    };


    // ==========================================
    // SECURITY FILTER CHAIN
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // Disable CSRF for stateless REST API
                .csrf(csrf -> csrf.disable())


                // CORS
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // JWT = stateless authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // Authentication provider
                .authenticationProvider(
                        authenticationProvider
                )


                // JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )


                // ==========================================
                // AUTHORIZATION
                // ==========================================

                .authorizeHttpRequests(auth -> auth


                        // ==================================
                        // PUBLIC ENDPOINTS
                        // ==================================

                        .requestMatchers(
                                PUBLIC_ENDPOINTS
                        )
                        .permitAll()


                        // ==========================================
// EMPLOYEES
// ==========================================

// ADMIN + EMPLOYEE can view employees
.requestMatchers(
        HttpMethod.GET,
        "/api/employees/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach create endpoint
// Actual owner check is handled by @PreAuthorize
.requestMatchers(
        HttpMethod.POST,
        "/api/employees/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach update endpoint
// Actual owner check is handled by @PreAuthorize
.requestMatchers(
        HttpMethod.PUT,
        "/api/employees/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach PATCH endpoint
.requestMatchers(
        HttpMethod.PATCH,
        "/api/employees/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach delete endpoint
.requestMatchers(
        HttpMethod.DELETE,
        "/api/employees/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


                        // ==========================================
// DEPARTMENTS
// ==========================================

// ADMIN + EMPLOYEE can view departments
.requestMatchers(
        HttpMethod.GET,
        "/api/departments/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach create endpoint
.requestMatchers(
        HttpMethod.POST,
        "/api/departments/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach update endpoint
.requestMatchers(
        HttpMethod.PUT,
        "/api/departments/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach PATCH endpoint
.requestMatchers(
        HttpMethod.PATCH,
        "/api/departments/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)


// ADMIN + EMPLOYEE can reach delete endpoint
.requestMatchers(
        HttpMethod.DELETE,
        "/api/departments/**"
)
.hasAnyRole(
        "ADMIN",
        "EMPLOYEE"
)

                        // ==================================
                        // ORGANIZATION APPLICATIONS
                        // ==================================

                        // ADMIN + EMPLOYEE can submit application
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/organization-applications"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "EMPLOYEE"
                        )


                        // ADMIN + EMPLOYEE can view
                        // their own applications
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/organization-applications/my"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "EMPLOYEE"
                        )


                        // ADMIN only - view all applications
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/organization-applications"
                        )
                        .hasRole("ADMIN")


                        // ADMIN only - view pending applications
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/organization-applications/pending"
                        )
                        .hasRole("ADMIN")


                        // ADMIN only - approve application
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/organization-applications/*/approve"
                        )
                        .hasRole("ADMIN")


                        // ADMIN only - reject application
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/organization-applications/*/reject"
                        )
                        .hasRole("ADMIN")

                        // ==================================
// ADMIN USER MANAGEMENT
// ==================================

.requestMatchers(
        "/api/admin/**"
)
.hasRole("ADMIN")
                        // ==================================
                        // EVERYTHING ELSE
                        // ==================================

                        .anyRequest()
                        .authenticated()
                );


        return http.build();
    }


    // ==========================================
    // CORS CONFIGURATION
    // ==========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOriginPatterns(
                List.of("*")
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }

}