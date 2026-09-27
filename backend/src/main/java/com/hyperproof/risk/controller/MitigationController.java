package com.hyperproof.risk.controller;

import com.hyperproof.risk.dto.CreateMitigationRequest;
import com.hyperproof.risk.dto.MitigationResponse;
import com.hyperproof.risk.dto.UpdateMitigationRequest;
import com.hyperproof.risk.service.MitigationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risks/{riskId}/mitigations")
@Tag(name = "Mitigations", description = "Mitigation / Control endpoints under specific risks")
public class MitigationController {

    private final MitigationService mitigationService;

    public MitigationController(MitigationService mitigationService) {
        this.mitigationService = mitigationService;
    }

    @PostMapping
    @Operation(summary = "Create mitigation under a risk", description = "Adds a mitigating control to a risk and updates the risk's residual score")
    public ResponseEntity<MitigationResponse> createMitigation(
            @PathVariable Long riskId,
            @Valid @RequestBody CreateMitigationRequest request) {
        MitigationResponse created = mitigationService.createMitigation(riskId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List mitigations for a risk", description = "Retrieves all mitigating controls applied to a given risk")
    public ResponseEntity<List<MitigationResponse>> getMitigationsForRisk(@PathVariable Long riskId) {
        List<MitigationResponse> mitigations = mitigationService.getMitigationsForRisk(riskId);
        return ResponseEntity.ok(mitigations);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a mitigation", description = "Updates a mitigating control's description or effectiveness rating")
    public ResponseEntity<MitigationResponse> updateMitigation(
            @PathVariable Long riskId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateMitigationRequest request) {
        MitigationResponse updated = mitigationService.updateMitigation(riskId, id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a mitigation", description = "Removes a mitigating control. Prevents deleting the only control from a Closed risk")
    public ResponseEntity<Void> deleteMitigation(
            @PathVariable Long riskId,
            @PathVariable Long id) {
        mitigationService.deleteMitigation(riskId, id);
        return ResponseEntity.noContent().build();
    }
}
