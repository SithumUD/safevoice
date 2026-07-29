package com.sithum.safevoice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for super admin user startup seeding.
 * Binds properties prefixed with {@code app.seed.admin}.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.seed.admin")
public class AdminSeedProperties {

    private boolean enabled = true;
    private String email = "admin@safevoice.com";
    private String password = "AdminPassword123!";
    private String nickname = "SuperAdmin";
    private String bio = "SafeVoice Platform Super Administrator";
}
