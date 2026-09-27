package com.hyperproof.risk.dto;

import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Set;

public class UpdateRiskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Category is required (Operational, Financial, Compliance, Security, Strategic)")
    private RiskCategory category;

    private String owner;

    @NotNull(message = "Likelihood is required (1-5)")
    @Min(value = 1, message = "Likelihood must be an integer between 1 and 5")
    @Max(value = 5, message = "Likelihood must be an integer between 1 and 5")
    private Integer likelihood;

    @NotNull(message = "Impact is required (1-5)")
    @Min(value = 1, message = "Impact must be an integer between 1 and 5")
    @Max(value = 5, message = "Impact must be an integer between 1 and 5")
    private Integer impact;

    @NotNull(message = "Status is required (Open, Mitigating, Closed)")
    private RiskStatus status;

    private LocalDate nextReviewDate;

    private Set<String> complianceFrameworks;

    public UpdateRiskRequest() {}

    public UpdateRiskRequest(String title, String description, RiskCategory category, String owner, Integer likelihood, Integer impact, RiskStatus status) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.owner = owner;
        this.likelihood = likelihood;
        this.impact = impact;
        this.status = status;
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

    public LocalDate getNextReviewDate() {
        return nextReviewDate;
    }

    public void setNextReviewDate(LocalDate nextReviewDate) {
        this.nextReviewDate = nextReviewDate;
    }

    public Set<String> getComplianceFrameworks() {
        return complianceFrameworks;
    }

    public void setComplianceFrameworks(Set<String> complianceFrameworks) {
        this.complianceFrameworks = complianceFrameworks;
    }
}
