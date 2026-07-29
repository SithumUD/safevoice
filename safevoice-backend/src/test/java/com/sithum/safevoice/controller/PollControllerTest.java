package com.sithum.safevoice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.CreatePollRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.enums.Category;
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

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class PollControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userJwtToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("polluser@safevoice.com", "Password123!", "PollTester");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        userJwtToken = objectMapper.readTree(responseContent).get("accessToken").asText();
    }

    @Test
    @DisplayName("Should successfully retrieve active community polls")
    void testGetPolls() throws Exception {
        mockMvc.perform(get("/api/v1/polls?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Should create topic with attached poll and allow voting")
    void testCreateTopicWithPollAndVote() throws Exception {
        CreatePollRequest pollReq = new CreatePollRequest(
                "Which civic initiative should be prioritized?",
                List.of("Public Transport Improvement", "Renewable Energy Support", "Digital Government Access"),
                false,
                null
        );

        CreateTopicRequest topicReq = new CreateTopicRequest(
                Category.POLLS,
                "Civic Priorities Poll 2026",
                "Please vote on the top civic initiative for our community this year.",
                false,
                null,
                null,
                pollReq
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/topics")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topicReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hasPoll").value(true))
                .andExpect(jsonPath("$.poll.options").isArray())
                .andReturn();

        String pollId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("poll").get("id").asText();
        String optionId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("poll").get("options").get(0).get("id").asText();

        // Vote on Option 1
        String votePayload = String.format("{\"optionIds\": [\"%s\"]}", optionId);

        mockMvc.perform(post("/api/v1/polls/" + pollId + "/vote")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(votePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVotes").value(1));
    }
}
