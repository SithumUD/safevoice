package com.sithum.safevoice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for JWT authentication & refresh tokens.
 * Binds properties prefixed with {@code app.jwt}.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private long expirationMs = 900000L; // 15 mins default
    private long refreshExpirationMs = 604800000L; // 7 days default
}
