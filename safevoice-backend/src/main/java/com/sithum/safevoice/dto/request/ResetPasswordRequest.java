package com.sithum.safevoice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Email address is required.")
    @Email(message = "Invalid email address format.")
    private String email;

    @NotBlank(message = "OTP verification code is required.")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits.")
    private String otp;

    @NotBlank(message = "New password is required.")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters.")
    private String newPassword;

    public ResetPasswordRequest() {
    }

    public ResetPasswordRequest(String email, String otp, String newPassword) {
        this.email = email;
        this.otp = otp;
        this.newPassword = newPassword;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
