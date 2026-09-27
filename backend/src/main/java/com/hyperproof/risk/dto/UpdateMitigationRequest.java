package com.hyperproof.risk.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateMitigationRequest {

    @NotBlank(message = "Mitigation description is required")
    private String description;

    @NotNull(message = "Effectiveness is required (1-5)")
    @Min(value = 1, message = "Effectiveness must be an integer between 1 and 5")
    @Max(value = 5, message = "Effectiveness must be an integer between 1 and 5")
    private Integer effectiveness;

    public UpdateMitigationRequest() {}

    public UpdateMitigationRequest(String description, Integer effectiveness) {
        this.description = description;
        this.effectiveness = effectiveness;
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
}
