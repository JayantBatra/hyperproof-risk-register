package com.hyperproof.risk.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyperproof.risk.dto.CreateMitigationRequest;
import com.hyperproof.risk.dto.CreateRiskRequest;
import com.hyperproof.risk.dto.UpdateRiskRequest;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Risk Management Full Lifecycle API Integration Test")
class RiskManagementApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("End-to-End: Create risk -> Add mitigation -> Fetch risk & verify residual score -> Enforce business rules")
    void testEndToEndRiskAndMitigationLifecycle() throws Exception {
        // Step 1: Create a critical risk (Likelihood: 4, Impact: 5 => Inherent Score: 20, Severity: Critical)
        CreateRiskRequest createRequest = new CreateRiskRequest(
            "SQL Injection in Customer Portal",
            "Unsanitized search parameters permit unauthorized data extraction.",
            RiskCategory.Security,
            "Application Security Team",
            4, 5,
            RiskStatus.Open
        );

        MvcResult createResult = mockMvc.perform(post("/api/risks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.inherentScore").value(20))
            .andExpect(jsonPath("$.inherentSeverity").value("Critical"))
            .andExpect(jsonPath("$.residualScore").value(20))
            .andExpect(jsonPath("$.residualSeverity").value("Critical"))
            .andExpect(jsonPath("$.mitigationCount").value(0))
            .andReturn();

        JsonNode createdRiskJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long riskId = createdRiskJson.get("id").asLong();

        // Step 2: Fetch the risk by ID to verify retrieval
        mockMvc.perform(get("/api/risks/" + riskId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("SQL Injection in Customer Portal"))
            .andExpect(jsonPath("$.residualScore").value(20));

        // Step 3: Add a highly effective mitigation (Effectiveness: 5)
        CreateMitigationRequest mitigationRequest = new CreateMitigationRequest(
            "Migrate all database queries to Parameterized Prepared Statements and add Web Application Firewall (WAF) rule",
            5
        );

        MvcResult mitigationResult = mockMvc.perform(post("/api/risks/" + riskId + "/mitigations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mitigationRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.effectiveness").value(5))
            .andReturn();

        JsonNode mitigationJson = objectMapper.readTree(mitigationResult.getResponse().getContentAsString());
        long mitigationId = mitigationJson.get("id").asLong();

        // Step 4: Fetch risk again and verify the residual score is meaningfully lower!
        // With inherent 20 and effectiveness 5 (75% mitigation factor):
        // 20 * 0.25 = 5.0 => Residual Score: 5 (Severity: Low)
        mockMvc.perform(get("/api/risks/" + riskId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.inherentScore").value(20))
            .andExpect(jsonPath("$.inherentSeverity").value("Critical"))
            .andExpect(jsonPath("$.residualScore").value(5))
            .andExpect(jsonPath("$.residualSeverity").value("Low"))
            .andExpect(jsonPath("$.mitigationCount").value(1))
            .andExpect(jsonPath("$.mitigationPercentage").value(75.0));

        // Step 5: Transition the risk to Closed (succeeds because it has 1 mitigation!)
        UpdateRiskRequest closeRequest = new UpdateRiskRequest(
            "SQL Injection in Customer Portal",
            "Unsanitized search parameters permit unauthorized data extraction.",
            RiskCategory.Security,
            "Application Security Team",
            4, 5,
            RiskStatus.Closed
        );

        mockMvc.perform(put("/api/risks/" + riskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(closeRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("Closed"));

        // Step 6: Verify Business Rule: Cannot delete the only mitigation from a Closed risk
        mockMvc.perform(delete("/api/risks/" + riskId + "/mitigations/" + mitigationId))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.error").value("Unprocessable Entity"))
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Cannot delete the only mitigating control from a Closed risk")));

        // Step 7: Re-open the risk to Mitigating
        UpdateRiskRequest reopenRequest = new UpdateRiskRequest(
            "SQL Injection in Customer Portal",
            "Unsanitized search parameters permit unauthorized data extraction.",
            RiskCategory.Security,
            "Application Security Team",
            4, 5,
            RiskStatus.Mitigating
        );

        mockMvc.perform(put("/api/risks/" + riskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reopenRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("Mitigating"));

        // Step 8: Delete the mitigation now that it is reopened
        mockMvc.perform(delete("/api/risks/" + riskId + "/mitigations/" + mitigationId))
            .andExpect(status().isNoContent());

        // Step 9: Verify Business Rule: Now with 0 mitigations, attempting to mark Closed is rejected!
        mockMvc.perform(put("/api/risks/" + riskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(closeRequest)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.error").value("Unprocessable Entity"))
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("zero mitigating controls")));
    }
}
