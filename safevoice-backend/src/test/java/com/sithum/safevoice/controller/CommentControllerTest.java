package com.sithum.safevoice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithum.safevoice.dto.request.CreateCommentRequest;
import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.ReactionRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.ReactionType;
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
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userJwtToken;
    private String createdTopicId;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("commentuser@safevoice.com", "Password123!", "Commenter");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        userJwtToken = objectMapper.readTree(responseContent).get("accessToken").asText();

        // Create topic to comment on
        CreateTopicRequest topicReq = new CreateTopicRequest(
                Category.COMMUNITY,
                "Topic for Comment Testing",
                "Description for testing comments and reactions.",
                false,
                null,
                null,
                null
        );

        MvcResult topicResult = mockMvc.perform(post("/api/v1/topics")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topicReq)))
                .andExpect(status().isCreated())
                .andReturn();

        createdTopicId = objectMapper.readTree(topicResult.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    @DisplayName("Should successfully post a comment on a topic and retrieve comment list")
    void testPostAndGetComments() throws Exception {
        CreateCommentRequest commentReq = new CreateCommentRequest(
                "This is a community comment testing post response.",
                false,
                null,
                null,
                null
        );

        MvcResult commentResult = mockMvc.perform(post("/api/v1/topics/" + createdTopicId + "/comments")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body").value("This is a community comment testing post response."))
                .andReturn();

        String commentId = objectMapper.readTree(commentResult.getResponse().getContentAsString()).get("id").asText();

        // Get topic comment list
        mockMvc.perform(get("/api/v1/topics/" + createdTopicId + "/comments?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(1));

        // React LIKE to comment
        ReactionRequest reactionReq = new ReactionRequest(ReactionType.LIKE);
        mockMvc.perform(post("/api/v1/comments/" + commentId + "/react")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reactionReq)))
                .andExpect(status().isOk());
    }
}
