package com.sithum.safevoice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
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
public class TopicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private UserRepository userRepository;

    private String userJwtToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("topicuser@safevoice.com", "Password123!", "TopicTester");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        userJwtToken = objectMapper.readTree(responseContent).get("accessToken").asText();
    }

    @Test
    @DisplayName("Should successfully list public topics feed")
    void testGetTopicsFeed() throws Exception {
        mockMvc.perform(get("/api/v1/topics?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    @DisplayName("Should successfully create a new discussion topic")
    void testCreateTopic() throws Exception {
        CreateTopicRequest createReq = new CreateTopicRequest(
                Category.CIVIC,
                "Civic Community Discussion Title",
                "Detailed description of civic topic for community testing purposes.",
                false,
                null,
                null,
                null
        );

        mockMvc.perform(post("/api/v1/topics")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Civic Community Discussion Title"))
                .andExpect(jsonPath("$.category").value("CIVIC"));
    }

    @Test
    @DisplayName("Should allow bookmarking/saving a topic")
    void testSaveTopic() throws Exception {
        // Create topic first
        CreateTopicRequest createReq = new CreateTopicRequest(
                Category.GENERAL,
                "General Discussion to Save",
                "Description for testing topic bookmarking.",
                false,
                null,
                null,
                null
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/topics")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String topicId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Bookmark topic
        mockMvc.perform(post("/api/v1/topics/" + topicId + "/save")
                        .header("Authorization", "Bearer " + userJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved").value(true));
    }
}
