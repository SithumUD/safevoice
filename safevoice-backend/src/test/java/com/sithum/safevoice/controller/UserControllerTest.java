package com.sithum.safevoice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.dto.request.UpdateFcmTokenRequest;
import com.sithum.safevoice.dto.request.UpdateProfileRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userJwtToken;
    private String userId;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("profileuser@safevoice.com", "Password123!", "ProfileTester");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        userJwtToken = objectMapper.readTree(responseContent).get("accessToken").asText();
        userId = objectMapper.readTree(responseContent).get("user").get("id").asText();
    }

    @Test
    @DisplayName("Should successfully fetch public profile by user ID")
    void testGetPublicProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.nickname").value("ProfileTester"));
    }

    @Test
    @DisplayName("Should successfully update authenticated user profile details")
    void testUpdateProfile() throws Exception {
        UpdateProfileRequest updateReq = new UpdateProfileRequest("UpdatedNick", "Updated community bio text.", "https://example.com/avatar.jpg");

        mockMvc.perform(put("/api/v1/users/me")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("UpdatedNick"))
                .andExpect(jsonPath("$.bio").value("Updated community bio text."));
    }

    @Test
    @DisplayName("Should successfully update FCM push token")
    void testUpdateFcmToken() throws Exception {
        UpdateFcmTokenRequest fcmReq = new UpdateFcmTokenRequest("fcm_test_token_1234567890");

        mockMvc.perform(put("/api/v1/users/me/fcm-token")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fcmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }
}
