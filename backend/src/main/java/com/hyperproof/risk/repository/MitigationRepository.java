package com.hyperproof.risk.repository;

import com.hyperproof.risk.model.Mitigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MitigationRepository extends JpaRepository<Mitigation, Long> {
    List<Mitigation> findByRiskIdOrderByCreatedAtAsc(Long riskId);
    Optional<Mitigation> findByIdAndRiskId(Long id, Long riskId);
    long countByRiskId(Long riskId);
}
