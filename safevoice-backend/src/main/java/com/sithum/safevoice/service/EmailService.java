package com.sithum.safevoice.service;

/**
 * Service interface for dispatching system email notifications (e.g. OTPs via Brevo).
 */
public interface EmailService {

    /**
     * Sends a 6-digit OTP code to the recipient's email address for password reset verification.
     */
    void sendPasswordResetOtp(String toEmail, String otp);
}
