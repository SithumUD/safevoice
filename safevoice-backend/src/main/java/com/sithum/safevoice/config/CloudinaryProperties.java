package com.sithum.safevoice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Cloudinary Media Cloud integration.
 * Binds properties prefixed with {@code cloudinary}.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryProperties {

    private String cloudName;
    private String apiKey;
    private String apiSecret;
    private String uploadPreset;
}
