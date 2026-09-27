package com.hyperproof.risk.dto;

import com.hyperproof.risk.model.Mitigation;
import java.time.Instant;

public class MitigationResponse {

    private Long id;
    private Long riskId;
    private String description;
    private Integer effectiveness;
    private Instant createdAt;

    public MitigationResponse() {}

    public MitigationResponse(Long id, Long riskId, String description, Integer effectiveness, Instant createdAt) {
        this.id = id;
        this.riskId = riskId;
        this.description = description;
        this.effectiveness = effectiveness;
        this.createdAt = createdAt;
    }

    public static MitigationResponse fromEntity(Mitigation mitigation) {
        return new MitigationResponse(
            mitigation.getId(),
            mitigation.getRisk() != null ? mitigation.getRisk().getId() : null,
            mitigation.getDescription(),
            mitigation.getEffectiveness(),
            mitigation.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRiskId() {
        return riskId;
    }

    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getEffectiveness() {
        return effectiveness;
    }

    public void setEffectiveness(Integer effectiveness) {
        this.effectiveness = effectiveness;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
