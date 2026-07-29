package com.sithum.safevoice.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Configuration class initializing Firebase Admin SDK for FCM push notifications.
 */
@Configuration
public class FCMConfig {

    private static final Logger log = LoggerFactory.getLogger(FCMConfig.class);

    @Value("${app.fcm.credentials-file:}")
    private String credentialsFile;

    @PostConstruct
    public void initFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try {
            InputStream serviceAccount = null;

            if (credentialsFile != null && !credentialsFile.isBlank() && Files.exists(Paths.get(credentialsFile))) {
                log.info("Loading Firebase credentials from file: {}", credentialsFile);
                serviceAccount = new FileInputStream(credentialsFile);
            } else {
                String envCredentials = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                if (envCredentials != null && !envCredentials.isBlank() && Files.exists(Paths.get(envCredentials))) {
                    log.info("Loading Firebase credentials from env GOOGLE_APPLICATION_CREDENTIALS: {}", envCredentials);
                    serviceAccount = new FileInputStream(envCredentials);
                }
            }

            if (serviceAccount != null) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK initialized successfully.");
            } else {
                log.warn("Firebase service account credentials file not found. Push notifications will operate in mock/log-only mode until configured.");
            }
        } catch (Exception e) {
            log.error("Failed to initialize Firebase Admin SDK", e);
        }
    }
}
