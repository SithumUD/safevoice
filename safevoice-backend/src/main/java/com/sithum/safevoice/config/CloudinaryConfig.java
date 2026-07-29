package com.sithum.safevoice.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Spring configuration initializing the Cloudinary client bean for media storage operations.
 */
@Configuration
public class CloudinaryConfig {

    private final CloudinaryProperties cloudinaryProperties;

    public CloudinaryConfig(CloudinaryProperties cloudinaryProperties) {
        this.cloudinaryProperties = cloudinaryProperties;
    }

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudinaryProperties.getCloudName() != null ? cloudinaryProperties.getCloudName() : "");
        config.put("api_key", cloudinaryProperties.getApiKey() != null ? cloudinaryProperties.getApiKey() : "");
        config.put("api_secret", cloudinaryProperties.getApiSecret() != null ? cloudinaryProperties.getApiSecret() : "");
        config.put("secure", "true");
        return new Cloudinary(config);
    }
}
