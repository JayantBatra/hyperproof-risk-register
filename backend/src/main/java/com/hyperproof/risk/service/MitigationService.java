package com.hyperproof.risk.service;

import com.hyperproof.risk.dto.CreateMitigationRequest;
import com.hyperproof.risk.dto.MitigationResponse;
import com.hyperproof.risk.dto.UpdateMitigationRequest;
import com.hyperproof.risk.exception.BusinessRuleException;
import com.hyperproof.risk.exception.ResourceNotFoundException;
import com.hyperproof.risk.model.Mitigation;
import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.repository.MitigationRepository;
import com.hyperproof.risk.repository.RiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MitigationService {

    private final MitigationRepository mitigationRepository;
    private final RiskRepository riskRepository;

    public MitigationService(MitigationRepository mitigationRepository, RiskRepository riskRepository) {
        this.mitigationRepository = mitigationRepository;
        this.riskRepository = riskRepository;
    }

    public MitigationResponse createMitigation(Long riskId, CreateMitigationRequest request) {
        Risk risk = riskRepository.findByIdWithMitigations(riskId)
            .orElseThrow(() -> new ResourceNotFoundException("Risk not found with ID: " + riskId));

        Mitigation mitigation = new Mitigation(risk, request.getDescription().trim(), request.getEffectiveness());
        risk.addMitigation(mitigation);

        // If the risk was Open and now has an active mitigation, transition to Mitigating if still Open
        if (risk.getStatus() == RiskStatus.Open) {
            risk.setStatus(RiskStatus.Mitigating);
        }

        Mitigation saved = mitigationRepository.save(mitigation);
        riskRepository.save(risk);

        return MitigationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MitigationResponse> getMitigationsForRisk(Long riskId) {
        if (!riskRepository.existsById(riskId)) {
            throw new ResourceNotFoundException("Risk not found with ID: " + riskId);
        }
        return mitigationRepository.findByRiskIdOrderByCreatedAtAsc(riskId).stream()
            .map(MitigationResponse::fromEntity)
            .collect(Collectors.toList());
    }

    public MitigationResponse updateMitigation(Long riskId, Long mitigationId, UpdateMitigationRequest request) {
        Mitigation mitigation = mitigationRepository.findByIdAndRiskId(mitigationId, riskId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Mitigation not found with ID: " + mitigationId + " under Risk ID: " + riskId));

        mitigation.setDescription(request.getDescription().trim());
        mitigation.setEffectiveness(request.getEffectiveness());

        Mitigation updated = mitigationRepository.save(mitigation);
        return MitigationResponse.fromEntity(updated);
    }

    public void deleteMitigation(Long riskId, Long mitigationId) {
        Risk risk = riskRepository.findByIdWithMitigations(riskId)
            .orElseThrow(() -> new ResourceNotFoundException("Risk not found with ID: " + riskId));

        Mitigation mitigation = mitigationRepository.findByIdAndRiskId(mitigationId, riskId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Mitigation not found with ID: " + mitigationId + " under Risk ID: " + riskId));

        // Business Rule: Cannot remove the last mitigation from a Closed risk
        if (risk.getStatus() == RiskStatus.Closed && risk.getMitigations().size() <= 1) {
            throw new BusinessRuleException(
                "Cannot delete the only mitigating control from a Closed risk. " +
                "Auditors require at least one mitigating control for closed risks. Please re-open the risk first."
            );
        }

        risk.removeMitigation(mitigation);
        mitigationRepository.delete(mitigation);
    }
}
