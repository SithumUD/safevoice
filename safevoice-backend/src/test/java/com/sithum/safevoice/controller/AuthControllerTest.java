package com.sithum.safevoice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithum.safevoice.dto.request.ForgotPasswordRequest;
import com.sithum.safevoice.dto.request.LoginRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully register a new user and return JWT tokens")
    void testRegisterUser() throws Exception {
        RegisterRequest request = new RegisterRequest("testuser@safevoice.com", "Password123!", "TestUser");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("testuser@safevoice.com"))
                .andExpect(jsonPath("$.user.nickname").value("TestUser"));
    }

    @Test
    @DisplayName("Should successfully authenticate registered user and return JWT")
    void testLoginUser() throws Exception {
        // Register first
        RegisterRequest registerReq = new RegisterRequest("logintest@safevoice.com", "Password123!", "LoginUser");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Perform Login
        LoginRequest loginReq = new LoginRequest("logintest@safevoice.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value("logintest@safevoice.com"));
    }

    @Test
    @DisplayName("Should accept forgot password request cleanly")
    void testForgotPassword() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest("testuser@safevoice.com");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }
}
