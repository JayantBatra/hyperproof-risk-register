package com.hyperproof.risk.dto;

import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.model.SeverityBand;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class RiskResponse {

    private Long id;
    private String title;
    private String description;
    private RiskCategory category;
    private String owner;
    private Integer likelihood;
    private Integer impact;
    private RiskStatus status;

    private Integer inherentScore;
    private SeverityBand inherentSeverity;

    private Integer residualScore;
    private Double exactResidualScore;
    private SeverityBand residualSeverity;

    private Double mitigationPercentage;
    private Integer mitigationCount;

    private List<MitigationResponse> mitigations = new ArrayList<>();

    private LocalDate nextReviewDate;
    private boolean overdue;
    private Set<String> complianceFrameworks;

    private Instant createdAt;
    private Instant updatedAt;

    public RiskResponse() {}

    public static RiskResponse from(Risk risk,
                                   int inherentScore,
                                   SeverityBand inherentSeverity,
                                   int residualScore,
                                   double exactResidualScore,
                                   SeverityBand residualSeverity,
                                   double mitigationPercentage) {
        RiskResponse response = new RiskResponse();
        response.setId(risk.getId());
        response.setTitle(risk.getTitle());
        response.setDescription(risk.getDescription());
        response.setCategory(risk.getCategory());
        response.setOwner(risk.getOwner());
        response.setLikelihood(risk.getLikelihood());
        response.setImpact(risk.getImpact());
        response.setStatus(risk.getStatus());

        response.setInherentScore(inherentScore);
        response.setInherentSeverity(inherentSeverity);

        response.setResidualScore(residualScore);
        response.setExactResidualScore(exactResidualScore);
        response.setResidualSeverity(residualSeverity);

        response.setMitigationPercentage(mitigationPercentage);

        if (risk.getMitigations() != null) {
            response.setMitigationCount(risk.getMitigations().size());
            response.setMitigations(risk.getMitigations().stream()
                .map(MitigationResponse::fromEntity)
                .collect(Collectors.toList()));
        } else {
            response.setMitigationCount(0);
            response.setMitigations(new ArrayList<>());
        }

        response.setNextReviewDate(risk.getNextReviewDate());
        if (risk.getNextReviewDate() != null) {
            response.setOverdue(risk.getNextReviewDate().isBefore(LocalDate.now()) && risk.getStatus() != RiskStatus.Closed);
        } else {
            response.setOverdue(false);
        }

        response.setComplianceFrameworks(risk.getComplianceFrameworks());
        response.setCreatedAt(risk.getCreatedAt());
        response.setUpdatedAt(risk.getUpdatedAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RiskCategory getCategory() {
        return category;
    }

    public void setCategory(RiskCategory category) {
        this.category = category;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Integer getLikelihood() {
        return likelihood;
    }

    public void setLikelihood(Integer likelihood) {
        this.likelihood = likelihood;
    }

    public Integer getImpact() {
        return impact;
    }

    public void setImpact(Integer impact) {
        this.impact = impact;
    }

    public RiskStatus getStatus() {
        return status;
    }

    public void setStatus(RiskStatus status) {
        this.status = status;
    }

    public Integer getInherentScore() {
        return inherentScore;
    }

    public void setInherentScore(Integer inherentScore) {
        this.inherentScore = inherentScore;
    }

    public SeverityBand getInherentSeverity() {
        return inherentSeverity;
    }

    public void setInherentSeverity(SeverityBand inherentSeverity) {
        this.inherentSeverity = inherentSeverity;
    }

    public Integer getResidualScore() {
        return residualScore;
    }

    public void setResidualScore(Integer residualScore) {
        this.residualScore = residualScore;
    }

    public Double getExactResidualScore() {
        return exactResidualScore;
    }

    public void setExactResidualScore(Double exactResidualScore) {
        this.exactResidualScore = exactResidualScore;
    }

    public SeverityBand getResidualSeverity() {
        return residualSeverity;
    }

    public void setResidualSeverity(SeverityBand residualSeverity) {
        this.residualSeverity = residualSeverity;
    }

    public Double getMitigationPercentage() {
        return mitigationPercentage;
    }

    public void setMitigationPercentage(Double mitigationPercentage) {
        this.mitigationPercentage = mitigationPercentage;
    }

    public Integer getMitigationCount() {
        return mitigationCount;
    }

    public void setMitigationCount(Integer mitigationCount) {
        this.mitigationCount = mitigationCount;
    }

    public List<MitigationResponse> getMitigations() {
        return mitigations;
    }

    public void setMitigations(List<MitigationResponse> mitigations) {
        this.mitigations = mitigations;
    }

    public LocalDate getNextReviewDate() {
        return nextReviewDate;
    }

    public void setNextReviewDate(LocalDate nextReviewDate) {
        this.nextReviewDate = nextReviewDate;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public Set<String> getComplianceFrameworks() {
        return complianceFrameworks;
    }

    public void setComplianceFrameworks(Set<String> complianceFrameworks) {
        this.complianceFrameworks = complianceFrameworks;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
