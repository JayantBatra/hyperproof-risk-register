package com.hyperproof.risk.controller;

import com.hyperproof.risk.dto.CreateRiskRequest;
import com.hyperproof.risk.dto.RiskResponse;
import com.hyperproof.risk.dto.UpdateRiskRequest;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.service.RiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risks")
@Tag(name = "Risks", description = "Risk Register endpoints for managing organizational risks")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    @PostMapping
    @Operation(summary = "Create a new risk", description = "Creates a new organizational risk and computes initial inherent and residual scores")
    public ResponseEntity<RiskResponse> createRisk(@Valid @RequestBody CreateRiskRequest request) {
        RiskResponse created = riskService.createRisk(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List risks", description = "Lists risks with optional category and status filtering, sorted by residual score descending by default")
    public ResponseEntity<List<RiskResponse>> listRisks(
            @RequestParam(required = false) RiskCategory category,
            @RequestParam(required = false) RiskStatus status,
            @RequestParam(defaultValue = "residualScore") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        List<RiskResponse> risks = riskService.listRisks(category, status, sortBy, sortOrder);
        return ResponseEntity.ok(risks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get risk by ID", description = "Fetches a single risk by ID including all associated mitigations and computed scores")
    public ResponseEntity<RiskResponse> getRiskById(@PathVariable Long id) {
        RiskResponse risk = riskService.getRiskById(id);
        return ResponseEntity.ok(risk);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a risk", description = "Updates an existing risk. Validates business rule that a risk cannot be Closed without mitigations")
    public ResponseEntity<RiskResponse> updateRisk(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRiskRequest request) {
        RiskResponse updated = riskService.updateRisk(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a risk", description = "Deletes a risk and cascades deletion to all associated mitigations")
    public ResponseEntity<Void> deleteRisk(@PathVariable Long id) {
        riskService.deleteRisk(id);
        return ResponseEntity.noContent().build();
    }
}
