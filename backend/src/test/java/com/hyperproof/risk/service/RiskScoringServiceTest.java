package com.hyperproof.risk.service;

import com.hyperproof.risk.model.Mitigation;
import com.hyperproof.risk.model.SeverityBand;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("RiskScoringService Unit Tests")
class RiskScoringServiceTest {

    private RiskScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new RiskScoringService();
    }

    @Nested
    @DisplayName("Inherent Score Calculation")
    class InherentScoreTests {

        @ParameterizedTest(name = "Likelihood={0}, Impact={1} => Inherent={2}")
        @CsvSource({
            "1, 1, 1",
            "1, 5, 5",
            "3, 3, 9",
            "4, 5, 20",
            "5, 5, 25"
        })
        void testValidInherentScores(int likelihood, int impact, int expectedScore) {
            int score = scoringService.calculateInherentScore(likelihood, impact);
            assertThat(score).isEqualTo(expectedScore);
        }

        @ParameterizedTest
        @CsvSource({
            "0, 3",
            "6, 3",
            "3, 0",
            "3, 6",
            "-1, 5"
        })
        void testInvalidLikelihoodOrImpactThrowsException(int likelihood, int impact) {
            assertThatThrownBy(() -> scoringService.calculateInherentScore(likelihood, impact))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Residual Score Calculation & Sanity Checks")
    class ResidualScoreTests {

        @Test
        @DisplayName("Sanity Check 1: Zero mitigations leaves residual equal to inherent")
        void testZeroMitigationsResidualEqualsInherent() {
            int inherentScore = 20;

            int residualWithEmptyList = scoringService.calculateResidualScore(inherentScore, Collections.emptyList());
            int residualWithNullList = scoringService.calculateResidualScore(inherentScore, null);

            assertThat(residualWithEmptyList).isEqualTo(inherentScore);
            assertThat(residualWithNullList).isEqualTo(inherentScore);
        }

        @Test
        @DisplayName("Sanity Check 2: Single highly effective mitigation (5) meaningfully reduces inherent score")
        void testSingleHighlyEffectiveMitigationMeaningfulReduction() {
            int inherentScore = 25; // Max possible inherent score
            Mitigation highControl = new Mitigation(null, "Automated MFA & Zero Trust", 5);

            int residual = scoringService.calculateResidualScore(inherentScore, List.of(highControl));

            // With effectiveness 5 (75% mitigation), 25 * 0.25 = 6.25 -> rounds to 6
            assertThat(residual).isLessThan(inherentScore);
            assertThat(residual).isEqualTo(6);
            assertThat(scoringService.getSeverityBand(residual)).isEqualTo(SeverityBand.Medium);
        }

        @Test
        @DisplayName("Sanity Check 3: Residual score should never fall below 1")
        void testResidualScoreNeverFallsBelowOne() {
            int inherentScore = 2; // Very low inherent score
            // Even with multiple maximum-effectiveness controls:
            List<Mitigation> heavyControls = List.of(
                new Mitigation(null, "Control 1", 5),
                new Mitigation(null, "Control 2", 5),
                new Mitigation(null, "Control 3", 5),
                new Mitigation(null, "Control 4", 5)
            );

            int residual = scoringService.calculateResidualScore(inherentScore, heavyControls);

            assertThat(residual).isGreaterThanOrEqualTo(1);
            assertThat(residual).isEqualTo(1);
        }

        @Test
        @DisplayName("Multiple mitigations provide diminishing returns and compound defense-in-depth")
        void testMultipleMitigationsCompounding() {
            int inherentScore = 25;

            Mitigation m1 = new Mitigation(null, "Control 1", 4); // 60% mitigation
            Mitigation m2 = new Mitigation(null, "Control 2", 3); // 45% mitigation

            int residualSingle = scoringService.calculateResidualScore(inherentScore, List.of(m1));
            int residualCombined = scoringService.calculateResidualScore(inherentScore, List.of(m1, m2));

            // m1 alone: 25 * (1 - 0.60) = 10
            assertThat(residualSingle).isEqualTo(10);

            // m1 + m2: 25 * (1 - 0.60) * (1 - 0.45) = 25 * 0.40 * 0.55 = 5.5 -> rounds to 6
            assertThat(residualCombined).isEqualTo(6);
            assertThat(residualCombined).isLessThan(residualSingle);
        }

        @Test
        @DisplayName("Residual score cannot exceed inherent score")
        void testResidualNeverExceedsInherent() {
            int inherent = 15;
            Mitigation weak = new Mitigation(null, "Informal memo", 1);
            int residual = scoringService.calculateResidualScore(inherent, List.of(weak));

            assertThat(residual).isLessThanOrEqualTo(inherent);
        }
    }

    @Nested
    @DisplayName("Severity Band Classification")
    class SeverityBandTests {

        @ParameterizedTest(name = "Score {0} => Band {1}")
        @CsvSource({
            "1, Low",
            "3, Low",
            "5, Low",
            "6, Medium",
            "9, Medium",
            "12, Medium",
            "13, High",
            "16, High",
            "19, High",
            "20, Critical",
            "24, Critical",
            "25, Critical"
        })
        void testSeverityBandBoundaries(int score, String expectedBandName) {
            SeverityBand band = scoringService.getSeverityBand(score);
            assertThat(band.name()).isEqualTo(expectedBandName);
        }
    }
}
