package com.hyperproof.risk.service;

import com.hyperproof.risk.dto.CreateRiskRequest;
import com.hyperproof.risk.dto.UpdateRiskRequest;
import com.hyperproof.risk.exception.BusinessRuleException;
import com.hyperproof.risk.model.Mitigation;
import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.repository.MitigationRepository;
import com.hyperproof.risk.repository.RiskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Risk Business Rule Tests")
class RiskServiceBusinessRuleTest {

    @Mock
    private RiskRepository riskRepository;

    @Mock
    private MitigationRepository mitigationRepository;

    private RiskScoringService scoringService;
    private RiskService riskService;
    private MitigationService mitigationService;

    @BeforeEach
    void setUp() {
        scoringService = new RiskScoringService();
        riskService = new RiskService(riskRepository, scoringService);
        mitigationService = new MitigationService(mitigationRepository, riskRepository);
    }

    @Test
    @DisplayName("Business Rule: Cannot create a new risk directly as Closed")
    void testCannotCreateRiskDirectlyClosed() {
        CreateRiskRequest request = new CreateRiskRequest(
            "Test Closed Risk",
            "Description",
            RiskCategory.Compliance,
            "Compliance Team",
            3, 3,
            RiskStatus.Closed
        );

        assertThatThrownBy(() -> riskService.createRisk(request))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("A risk cannot be created directly in 'Closed' status without any mitigating controls");

        verify(riskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Business Rule: Cannot update a risk to Closed if it has 0 mitigations")
    void testCannotUpdateRiskToClosedWithZeroMitigations() {
        Risk riskWithoutMitigations = new Risk(
            "Unmitigated Risk",
            "Description",
            RiskCategory.Security,
            "Security Team",
            4, 4,
            RiskStatus.Open
        );
        riskWithoutMitigations.setId(1L);

        when(riskRepository.findByIdWithMitigations(1L)).thenReturn(Optional.of(riskWithoutMitigations));

        UpdateRiskRequest updateRequest = new UpdateRiskRequest(
            "Unmitigated Risk",
            "Description",
            RiskCategory.Security,
            "Security Team",
            4, 4,
            RiskStatus.Closed
        );

        assertThatThrownBy(() -> riskService.updateRisk(1L, updateRequest))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("zero mitigating controls");

        verify(riskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Business Rule: Updating a risk to Closed SUCCEEDS if it has at least one mitigation")
    void testUpdateRiskToClosedSucceedsWithMitigations() {
        Risk riskWithMitigation = new Risk(
            "Mitigated Risk",
            "Description",
            RiskCategory.Security,
            "Security Team",
            4, 4,
            RiskStatus.Mitigating
        );
        riskWithMitigation.setId(1L);
        riskWithMitigation.addMitigation(new Mitigation(riskWithMitigation, "Control 1", 5));

        when(riskRepository.findByIdWithMitigations(1L)).thenReturn(Optional.of(riskWithMitigation));
        when(riskRepository.save(any(Risk.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateRiskRequest updateRequest = new UpdateRiskRequest(
            "Mitigated Risk",
            "Description",
            RiskCategory.Security,
            "Security Team",
            4, 4,
            RiskStatus.Closed
        );

        var response = riskService.updateRisk(1L, updateRequest);

        assertThat(response.getStatus()).isEqualTo(RiskStatus.Closed);
        verify(riskRepository).save(any(Risk.class));
    }

    @Test
    @DisplayName("Business Rule: Cannot delete the only mitigating control from a Closed risk")
    void testCannotDeleteOnlyMitigationFromClosedRisk() {
        Risk closedRisk = new Risk(
            "Closed Risk",
            "Description",
            RiskCategory.Operational,
            "Ops Lead",
            3, 3,
            RiskStatus.Closed
        );
        closedRisk.setId(10L);

        Mitigation mitigation = new Mitigation(closedRisk, "Sole Control", 4);
        mitigation.setId(20L);
        closedRisk.addMitigation(mitigation);

        when(riskRepository.findByIdWithMitigations(10L)).thenReturn(Optional.of(closedRisk));
        when(mitigationRepository.findByIdAndRiskId(20L, 10L)).thenReturn(Optional.of(mitigation));

        assertThatThrownBy(() -> mitigationService.deleteMitigation(10L, 20L))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("Cannot delete the only mitigating control from a Closed risk");

        verify(mitigationRepository, never()).delete(any());
    }
}
