package com.hyperproof.risk.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "risks")
public class Risk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RiskCategory category;

    @Column(length = 255)
    private String owner;

    @NotNull(message = "Likelihood is required")
    @Min(value = 1, message = "Likelihood must be between 1 and 5")
    @Max(value = 5, message = "Likelihood must be between 1 and 5")
    @Column(nullable = false)
    private Integer likelihood;

    @NotNull(message = "Impact is required")
    @Min(value = 1, message = "Impact must be between 1 and 5")
    @Max(value = 5, message = "Impact must be between 1 and 5")
    @Column(nullable = false)
    private Integer impact;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RiskStatus status = RiskStatus.Open;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "risk_compliance_frameworks", joinColumns = @JoinColumn(name = "risk_id"))
    @Column(name = "framework", length = 100)
    private Set<String> complianceFrameworks = new HashSet<>();

    @OneToMany(mappedBy = "risk", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @OrderBy("createdAt ASC")
    private List<Mitigation> mitigations = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Risk() {
    }

    public Risk(String title, String description, RiskCategory category, String owner, Integer likelihood, Integer impact, RiskStatus status) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.owner = owner;
        this.likelihood = likelihood;
        this.impact = impact;
        this.status = status != null ? status : RiskStatus.Open;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.status == null) {
            this.status = RiskStatus.Open;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addMitigation(Mitigation mitigation) {
        mitigations.add(mitigation);
        mitigation.setRisk(this);
    }

    public void removeMitigation(Mitigation mitigation) {
        mitigations.remove(mitigation);
        mitigation.setRisk(null);
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

    public List<Mitigation> getMitigations() {
        return mitigations;
    }

    public void setMitigations(List<Mitigation> mitigations) {
        this.mitigations = mitigations;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Risk risk = (Risk) o;
        return Objects.equals(id, risk.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
