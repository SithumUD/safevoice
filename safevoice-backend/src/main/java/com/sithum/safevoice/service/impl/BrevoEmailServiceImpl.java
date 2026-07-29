package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Implementation of {@link EmailService} using Brevo (formerly Sendinblue) v3 REST API.
 */
@Service
public class BrevoEmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailServiceImpl.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${app.email.brevo.api-key:xkeysib-placeholder}")
    private String apiKey;

    @Value("${app.email.brevo.sender-email:noreply@safevoice.com}")
    private String senderEmail;

    @Value("${app.email.brevo.sender-name:SafeVoice Security}")
    private String senderName;

    private final HttpClient httpClient;

    public BrevoEmailServiceImpl() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("[OTP DEBUG] Password reset code for {}: {}", toEmail, otp);

        if (apiKey == null || apiKey.isBlank() || apiKey.contains("placeholder")) {
            log.warn("Brevo API key not configured or using placeholder. OTP logged above for development.");
            return;
        }

        try {
            String jsonPayload = String.format("""
                    {
                      "sender": {"name": "%s", "email": "%s"},
                      "to": [{"email": "%s"}],
                      "subject": "SafeVoice - Password Reset Verification Code",
                      "htmlContent": "<html><body><h2>SafeVoice Password Reset</h2><p>Your 6-digit verification code is: <strong style='font-size:20px; color:#D85A30;'>%s</strong></p><p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p></body></html>"
                    }
                    """, escapeJson(senderName), escapeJson(senderEmail), escapeJson(toEmail), otp);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully dispatched password reset OTP email via Brevo to {}", toEmail);
            } else {
                log.error("Brevo API error (HTTP {}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Brevo to {}", toEmail, e);
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
