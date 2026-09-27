package com.hyperproof.risk.config;

import com.hyperproof.risk.model.Mitigation;
import com.hyperproof.risk.model.Risk;
import com.hyperproof.risk.model.RiskCategory;
import com.hyperproof.risk.model.RiskStatus;
import com.hyperproof.risk.repository.RiskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final RiskRepository riskRepository;

    public DataInitializer(RiskRepository riskRepository) {
        this.riskRepository = riskRepository;
    }

    @Override
    public void run(String... args) {
        if (riskRepository.count() > 0) {
            log.info("Database already populated. Skipping sample data initialization.");
            return;
        }

        log.info("Seeding realistic sample risks and mitigations into Risk Register...");

        // Risk 1: High/Critical Security Risk with multiple strong controls
        Risk risk1 = new Risk(
            "Unauthorized Access to Customer Database",
            "Potential exposure of sensitive customer PII through compromised administrative credentials or misconfigured service accounts.",
            RiskCategory.Security,
            "Security Operations",
            4, 5,
            RiskStatus.Mitigating
        );
        risk1.setNextReviewDate(LocalDate.now().plusMonths(2));
        risk1.setComplianceFrameworks(Set.of("SOC 2 CC6.1", "NIST CSF PR.AC-1"));
        risk1.addMitigation(new Mitigation(risk1, "Enforce hardware-backed MFA (FIDO2/WebAuthn) and just-in-time privileged access.", 5));
        risk1.addMitigation(new Mitigation(risk1, "Automated daily query audit logging and anomaly alerts in SIEM.", 4));
        riskRepository.save(risk1);

        // Risk 2: Critical Operational Risk (Vendor Outage)
        Risk risk2 = new Risk(
            "Primary Cloud Provider Regional Outage",
            "Prolonged outage in primary AWS region impacting customer-facing web services and document processing pipelines.",
            RiskCategory.Operational,
            "DevOps / SRE Lead",
            3, 5,
            RiskStatus.Mitigating
        );
        risk2.setNextReviewDate(LocalDate.now().minusDays(5)); // Intentionally overdue for demo
        risk2.setComplianceFrameworks(Set.of("SOC 2 A1.2", "NIST CSF PR.IP-4"));
        risk2.addMitigation(new Mitigation(risk2, "Multi-region active-standby database replication with automated 15-minute failover.", 4));
        riskRepository.save(risk2);

        // Risk 3: Open Critical Security Risk with ZERO mitigations
        Risk risk3 = new Risk(
            "Ransomware Infection via Phishing Attack on Employee Endpoints",
            "Zero-day credential harvesting or payload deployment compromising internal workstations and corporate VPN credentials.",
            RiskCategory.Security,
            "CISO",
            4, 5,
            RiskStatus.Open
        );
        risk3.setNextReviewDate(LocalDate.now().plusWeeks(1));
        risk3.setComplianceFrameworks(Set.of("NIST CSF DE.CM-4"));
        riskRepository.save(risk3);

        // Risk 4: Medium Compliance Risk
        Risk risk4 = new Risk(
            "GDPR / CCPA Data Subject Access Request (DSAR) SLA Breach",
            "Failure to honor consumer data export or erasure requests within mandatory 30-day statutory timeframes.",
            RiskCategory.Compliance,
            "Legal & Privacy Officer",
            3, 4,
            RiskStatus.Mitigating
        );
        risk4.setNextReviewDate(LocalDate.now().plusMonths(3));
        risk4.setComplianceFrameworks(Set.of("SOC 2 P1.1", "ISO 27701"));
        risk4.addMitigation(new Mitigation(risk4, "Automated data discovery and self-serve DSAR submission workflow.", 4));
        risk4.addMitigation(new Mitigation(risk4, "Quarterly privacy program external legal review.", 3));
        riskRepository.save(risk4);

        // Risk 5: Financial Risk
        Risk risk5 = new Risk(
            "Foreign Currency Exchange Volatility",
            "Fluctuations in EUR/GBP exchange rates impacting European customer contract margins and receivables.",
            RiskCategory.Financial,
            "Chief Financial Officer",
            4, 3,
            RiskStatus.Mitigating
        );
        risk5.setNextReviewDate(LocalDate.now().plusMonths(4));
        risk5.addMitigation(new Mitigation(risk5, "Quarterly rolling FX currency hedging contracts with tier-1 commercial bank.", 3));
        riskRepository.save(risk5);

        // Risk 6: Strategic Risk
        Risk risk6 = new Risk(
            "Loss of Specialized Cryptographic Engineering Talent",
            "Attrition of senior engineers with specialized zero-knowledge architecture knowledge without sufficient cross-training.",
            RiskCategory.Strategic,
            "VP of Engineering",
            2, 4,
            RiskStatus.Mitigating
        );
        risk6.setNextReviewDate(LocalDate.now().plusMonths(6));
        risk6.addMitigation(new Mitigation(risk6, "Comprehensive architectural specifications and rotating peer engineering assignments.", 3));
        riskRepository.save(risk6);

        // Risk 7: Closed Risk (with compliant mitigation)
        Risk risk7 = new Risk(
            "Legacy TLS 1.0 & 1.1 Insecure Protocol Support",
            "Deprecation of outdated TLS ciphers across legacy external integration webhook endpoints.",
            RiskCategory.Security,
            "API Platform Team",
            2, 2,
            RiskStatus.Closed
        );
        risk7.setNextReviewDate(LocalDate.now().plusYears(1));
        risk7.setComplianceFrameworks(Set.of("NIST CSF PR.DS-2"));
        risk7.addMitigation(new Mitigation(risk7, "Decommissioned legacy cipher suites at AWS CloudFront & Envoy proxy layers.", 5));
        riskRepository.save(risk7);

        log.info("Successfully seeded 7 sample risks with mitigations into Risk Register.");
    }
}
