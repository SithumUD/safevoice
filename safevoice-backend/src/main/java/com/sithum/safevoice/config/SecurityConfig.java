package com.sithum.safevoice.config;

import com.sithum.safevoice.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Enterprise Spring Security 6 Configuration.
 * Configures stateless JWT authentication, RBAC endpoint protection, and CORS filter chain integration.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public Authentication endpoints
                        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
                        // Authenticated Authentication endpoints
                        .requestMatchers("/api/v1/auth/me", "/api/v1/auth/logout", "/api/v1/auth/convert-guest").authenticated()
                        // Topic Management Endpoints (Admin & Moderator only)
                        .requestMatchers(HttpMethod.POST, "/api/v1/topics").hasAnyRole("MODERATOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/topics/**").hasAnyRole("MODERATOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/topics/**").hasAnyRole("MODERATOR", "ADMIN")
                        // Public Topic, Comment Tree, User Profile, Poll, and Avatar Read endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/topics", "/api/v1/topics/{id}", "/api/v1/topics/{topicId}/comments", "/api/v1/users/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/polls/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/media/avatars").permitAll()
                        // WebSocket Handshake & Swagger OpenAPI Docs Endpoints
                        .requestMatchers("/ws/**", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Moderation & Admin Endpoints
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("MODERATOR", "ADMIN")
                        // All other API endpoints require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
