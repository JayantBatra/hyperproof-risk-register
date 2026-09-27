package com.hyperproof.risk.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyperproof.risk.dto.CreateMitigationRequest;
import com.hyperproof.risk.dto.CreateRiskRequest;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.service.MitigationService;
import com.hyperproof.risk.service.RiskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {RiskController.class, MitigationController.class})
@DisplayName("Risk and Mitigation Controller Validation Tests")
class RiskControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RiskService riskService;

    @MockBean
    private MitigationService mitigationService;

    @Test
    @DisplayName("Validation: Reject risk creation when likelihood is out of 1-5 range (< 1)")
    void testRejectLikelihoodTooLow() throws Exception {
        CreateRiskRequest request = new CreateRiskRequest(
            "Valid Title", "Description", RiskCategory.Security, "Owner",
            0, 3, RiskStatus.Open
        );

        mockMvc.perform(post("/api/risks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Validation Failed"))
            .andExpect(jsonPath("$.validationErrors.likelihood").exists());
    }

    @Test
    @DisplayName("Validation: Reject risk creation when impact is out of 1-5 range (> 5)")
    void testRejectImpactTooHigh() throws Exception {
        CreateRiskRequest request = new CreateRiskRequest(
            "Valid Title", "Description", RiskCategory.Security, "Owner",
            3, 6, RiskStatus.Open
        );

        mockMvc.perform(post("/api/risks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Validation Failed"))
            .andExpect(jsonPath("$.validationErrors.impact").exists());
    }

    @Test
    @DisplayName("Validation: Reject risk creation when title is blank")
    void testRejectBlankTitle() throws Exception {
        CreateRiskRequest request = new CreateRiskRequest(
            "", "Description", RiskCategory.Security, "Owner",
            3, 3, RiskStatus.Open
        );

        mockMvc.perform(post("/api/risks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors.title").exists());
    }

    @Test
    @DisplayName("Validation: Reject mitigation creation when effectiveness is out of 1-5 range")
    void testRejectMitigationEffectivenessOutOfRange() throws Exception {
        CreateMitigationRequest request = new CreateMitigationRequest(
            "Valid description",
            6
        );

        mockMvc.perform(post("/api/risks/1/mitigations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors.effectiveness").exists());
    }

    @Test
    @DisplayName("Validation: Reject mitigation creation when description is blank")
    void testRejectBlankMitigationDescription() throws Exception {
        CreateMitigationRequest request = new CreateMitigationRequest(
            "  ",
            3
        );

        mockMvc.perform(post("/api/risks/1/mitigations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors.description").exists());
    }
}
