package com.hyperproof.risk.service;

import com.hyperproof.risk.model.Mitigation;
import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.SeverityBand;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Collections;

/**
 * Service responsible for calculating Inherent Risk Scores, Residual Risk Scores,
 * and mapping them to standardized Severity Bands.
 *
 * Scoring Philosophy:
 * - Inherent Risk = Likelihood (1-5) * Impact (1-5), ranging [1, 25].
 * - Residual Risk represents risk after defense-in-depth mitigating controls are applied.
 * - Each control reduces risk multiplicatively based on effectiveness (1-5):
 *     control_retention_factor = 1.0 - (effectiveness * 0.15)
 *     (e.g., effectiveness 5 mitigates 75% -> retention = 0.25; effectiveness 1 mitigates 15% -> retention = 0.85)
 * - Multiple mitigations compound multiplicatively with diminishing returns.
 * - Total unmitigated fraction is capped at a minimum floor of 0.10 (max 90% mitigation).
 * - Residual score is bounded: [1, inherentScore].
 */
@Service
public class RiskScoringService {

    public static final double EFFECTIVENESS_STEP = 0.15;
    public static final double MIN_RESIDUAL_FACTOR = 0.10; // Residual risk can never be 100% eliminated

    /**
     * Calculates the Inherent Risk Score: Likelihood * Impact.
     * Guaranteed to be in range [1, 25].
     */
    public int calculateInherentScore(int likelihood, int impact) {
        validateScoreInput(likelihood, "Likelihood");
        validateScoreInput(impact, "Impact");
        return likelihood * impact;
    }

    /**
     * Calculates the integer Residual Risk Score for a given inherent score and list of mitigations.
     * Satisfies all core constraints:
     * 1. If mitigations is empty, residual == inherent.
     * 2. Highly effective mitigation (5) reduces inherent meaningfully (e.g., 25 -> 6).
     * 3. Score never falls below 1.
     * 4. Score never exceeds inherent score.
     */
    public int calculateResidualScore(int inherentScore, Collection<Mitigation> mitigations) {
        if (inherentScore <= 1 || mitigations == null || mitigations.isEmpty()) {
            return Math.max(1, inherentScore);
        }

        double rawScore = calculateExactResidualScore(inherentScore, mitigations);
        long rounded = Math.round(rawScore);

        int residual = (int) rounded;
        // Bounded between 1 and inherentScore
        return Math.max(1, Math.min(inherentScore, residual));
    }

    /**
     * Calculates exact decimal residual score with 2 decimal places.
     */
    public double calculateExactResidualScore(int inherentScore, Collection<Mitigation> mitigations) {
        if (mitigations == null || mitigations.isEmpty()) {
            return inherentScore;
        }

        double retentionProduct = 1.0;
        for (Mitigation mitigation : mitigations) {
            if (mitigation == null || mitigation.getEffectiveness() == null) {
                continue;
            }
            int effectiveness = mitigation.getEffectiveness();
            validateScoreInput(effectiveness, "Effectiveness");

            double retention = 1.0 - (effectiveness * EFFECTIVENESS_STEP);
            retentionProduct *= retention;
        }

        // Apply floor so residual risk cannot be completely zeroed out
        double effectiveFactor = Math.max(MIN_RESIDUAL_FACTOR, retentionProduct);
        double raw = inherentScore * effectiveFactor;

        // Ensure at least 1.0
        double finalScore = Math.max(1.0, Math.min((double) inherentScore, raw));
        return BigDecimal.valueOf(finalScore).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * Calculates the percentage reduction achieved by all mitigations combined (0.0% to 90.0%).
     */
    public double calculateMitigationPercentage(int inherentScore, int residualScore) {
        if (inherentScore <= 0) return 0.0;
        double reduction = ((double) (inherentScore - residualScore) / inherentScore) * 100.0;
        return BigDecimal.valueOf(Math.max(0.0, reduction)).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * Maps an integer score (1-25) to its corresponding SeverityBand.
     */
    public SeverityBand getSeverityBand(int score) {
        return SeverityBand.fromScore(score);
    }

    private void validateScoreInput(int value, String fieldName) {
        if (value < 1 || value > 5) {
            throw new IllegalArgumentException(fieldName + " must be between 1 and 5 (got: " + value + ")");
        }
    }
}
