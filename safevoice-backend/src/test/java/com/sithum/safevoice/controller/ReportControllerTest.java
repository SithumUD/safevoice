package com.sithum.safevoice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithum.safevoice.dto.request.CreateReportRequest;
import com.sithum.safevoice.dto.request.CreateTopicRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.enums.Category;
import com.sithum.safevoice.enums.ReportReason;
import com.sithum.safevoice.enums.ReportTargetType;
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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userJwtToken;
    private String topicIdToReport;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("reporter@safevoice.com", "Password123!", "ReporterUser");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        userJwtToken = objectMapper.readTree(responseContent).get("accessToken").asText();

        // Create topic to report
        CreateTopicRequest topicReq = new CreateTopicRequest(
                Category.SAFETY,
                "Topic To Report",
                "Testing moderation report filing against topic.",
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

        topicIdToReport = objectMapper.readTree(topicResult.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    @DisplayName("Should successfully file a moderation report against a topic")
    void testFileReport() throws Exception {
        CreateReportRequest reportReq = new CreateReportRequest(
                ReportTargetType.TOPIC,
                UUID.fromString(topicIdToReport),
                null,
                null,
                ReportReason.SPAM,
                "Flagging suspicious spam topic"
        );

        mockMvc.perform(post("/api/v1/reports")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reportReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.reason").value("SPAM"));
    }
}
