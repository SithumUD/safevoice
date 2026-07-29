package com.sithum.safevoice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Enterprise OpenAPI 3 / Swagger UI Configuration.
 * Configures interactive Swagger documentation and JWT Bearer authorization support.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "SafeVoice REST API & Real-Time Messaging",
                version = "1.0.0",
                description = "Production-grade REST API and WebSocket STOMP platform for safe civic discourse, anonymous whistleblowing/reporting, interactive polling, and moderation.",
                contact = @Contact(name = "SafeVoice Development Team", email = "dev@safevoice.com")
        ),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Enter JWT Access Token generated from /api/v1/auth/login or /api/v1/auth/register."
)
public class OpenApiConfig {
}
