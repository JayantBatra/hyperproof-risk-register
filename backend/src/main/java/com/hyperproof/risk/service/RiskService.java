package com.hyperproof.risk.service;

import com.hyperproof.risk.dto.CreateRiskRequest;
import com.hyperproof.risk.dto.RiskResponse;
import com.hyperproof.risk.dto.UpdateRiskRequest;
import com.hyperproof.risk.exception.BusinessRuleException;
import com.hyperproof.risk.exception.ResourceNotFoundException;
import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.model.SeverityBand;
import com.hyperproof.risk.repository.RiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RiskService {

    private final RiskRepository riskRepository;
    private final RiskScoringService scoringService;

    public RiskService(RiskRepository riskRepository, RiskScoringService scoringService) {
        this.riskRepository = riskRepository;
        this.scoringService = scoringService;
    }

    public RiskResponse createRisk(CreateRiskRequest request) {
        // Business Rule Check: A new risk cannot be created directly as Closed with 0 mitigations
        if (request.getStatus() == RiskStatus.Closed) {
            throw new BusinessRuleException(
                "A risk cannot be created directly in 'Closed' status without any mitigating controls. " +
                "In compliance management, risks must be tracked through an active lifecycle and mitigated before closure."
            );
        }

        Risk risk = new Risk(
            request.getTitle().trim(),
            request.getDescription(),
            request.getCategory(),
            request.getOwner() != null ? request.getOwner().trim() : null,
            request.getLikelihood(),
            request.getImpact(),
            request.getStatus() != null ? request.getStatus() : RiskStatus.Open
        );

        if (request.getNextReviewDate() != null) {
            risk.setNextReviewDate(request.getNextReviewDate());
        }

        if (request.getComplianceFrameworks() != null && !request.getComplianceFrameworks().isEmpty()) {
            risk.setComplianceFrameworks(request.getComplianceFrameworks());
        }

        Risk saved = riskRepository.save(risk);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public RiskResponse getRiskById(Long id) {
        Risk risk = riskRepository.findByIdWithMitigations(id)
            .orElseThrow(() -> new ResourceNotFoundException("Risk not found with ID: " + id));
        return mapToResponse(risk);
    }

    @Transactional(readOnly = true)
    public List<RiskResponse> listRisks(RiskCategory category, RiskStatus status, String sortBy, String direction) {
        List<Risk> risks = riskRepository.findFiltered(category, status);

        List<RiskResponse> responses = risks.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

        // Default sorting: residual score descending
        Comparator<RiskResponse> comparator;
        if ("inherentScore".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(RiskResponse::getInherentScore);
        } else if ("title".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(RiskResponse::getTitle, String.CASE_INSENSITIVE_ORDER);
        } else if ("createdAt".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(RiskResponse::getCreatedAt);
        } else {
            // Default: residual score, breaking ties with inherent score descending
            comparator = Comparator.comparing(RiskResponse::getResidualScore)
                .thenComparing(RiskResponse::getExactResidualScore)
                .thenComparing(RiskResponse::getInherentScore);
        }

        if (!"asc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }

        responses.sort(comparator);
        return responses;
    }

    public RiskResponse updateRisk(Long id, UpdateRiskRequest request) {
        Risk risk = riskRepository.findByIdWithMitigations(id)
            .orElseThrow(() -> new ResourceNotFoundException("Risk not found with ID: " + id));

        // Business Rule Check: Cannot mark a risk "Closed" while it has zero mitigations
        if (request.getStatus() == RiskStatus.Closed && (risk.getMitigations() == null || risk.getMitigations().isEmpty())) {
            throw new BusinessRuleException(
                "Cannot mark risk '" + risk.getTitle() + "' as Closed because it has zero mitigating controls. " +
                "Auditors require demonstrable evidence of mitigating controls or accepted residual risk controls before closure."
            );
        }

        risk.setTitle(request.getTitle().trim());
        risk.setDescription(request.getDescription());
        risk.setCategory(request.getCategory());
        risk.setOwner(request.getOwner() != null ? request.getOwner().trim() : null);
        risk.setLikelihood(request.getLikelihood());
        risk.setImpact(request.getImpact());
        risk.setStatus(request.getStatus());
        risk.setNextReviewDate(request.getNextReviewDate());

        if (request.getComplianceFrameworks() != null) {
            risk.setComplianceFrameworks(request.getComplianceFrameworks());
        }

        Risk updated = riskRepository.save(risk);
        return mapToResponse(updated);
    }

    public void deleteRisk(Long id) {
        if (!riskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Risk not found with ID: " + id);
        }
        riskRepository.deleteById(id);
    }

    public RiskResponse mapToResponse(Risk risk) {
        int inherentScore = scoringService.calculateInherentScore(risk.getLikelihood(), risk.getImpact());
        SeverityBand inherentSeverity = scoringService.getSeverityBand(inherentScore);

        int residualScore = scoringService.calculateResidualScore(inherentScore, risk.getMitigations());
        double exactResidualScore = scoringService.calculateExactResidualScore(inherentScore, risk.getMitigations());
        SeverityBand residualSeverity = scoringService.getSeverityBand(residualScore);

        double mitigationPercentage = scoringService.calculateMitigationPercentage(inherentScore, residualScore);

        return RiskResponse.from(
            risk,
            inherentScore,
            inherentSeverity,
            residualScore,
            exactResidualScore,
            residualSeverity,
            mitigationPercentage
        );
    }
}
