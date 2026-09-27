package com.hyperproof.risk.repository;

import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Long> {

    @Query("SELECT r FROM Risk r LEFT JOIN FETCH r.mitigations WHERE r.id = :id")
    Optional<Risk> findByIdWithMitigations(@Param("id") Long id);

    @Query("SELECT DISTINCT r FROM Risk r LEFT JOIN FETCH r.mitigations WHERE " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Risk> findFiltered(@Param("category") RiskCategory category,
                           @Param("status") RiskStatus status);
}
