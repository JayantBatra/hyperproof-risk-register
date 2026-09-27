# Hyperproof Risk Register

An enterprise-grade, audit-ready **Risk Register** application built for the **Hyperproof Risk Management** team. Enables compliance and security teams to track organizational risks, compute raw inherent exposures, apply defense-in-depth mitigating controls, dynamically score residual risk, and maintain compliance integrity.

> **GitHub Repository:** [https://github.com/JayantBatra/hyperproof-risk-register](https://github.com/JayantBatra/hyperproof-risk-register)  
> *(If evaluating locally, see [REVIEWER_GUIDE.md](REVIEWER_GUIDE.md) for a curated evaluation walkthrough).*

---

## Architecture Overview

- **Backend:** Java 17, Spring Boot 3.3.5, Spring Data JPA, Hibernate, Bean Validation (Jakarta), SpringDoc OpenAPI (Swagger UI), H2 Database (zero-friction dev) & PostgreSQL profile.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Testing:** JUnit 5, AssertJ, Mockito, Spring Boot MockMvc Integration Tests, Node Test Runner.

```
TakeHomeAssignment/
├── backend/
│   ├── src/main/java/com/hyperproof/risk/
│   │   ├── config/              # CORS, OpenAPI Swagger, Sample Data Seeder
│   │   ├── controller/          # REST Controllers (/api/risks, /api/risks/{id}/mitigations)
│   │   ├── dto/                 # Request & Response DTOs with validation rules
│   │   ├── exception/           # BusinessRuleException & GlobalExceptionHandler
│   │   ├── model/               # Risk, Mitigation, RiskCategory, RiskStatus, SeverityBand
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   └── service/             # RiskScoringService, RiskService, MitigationService
│   └── src/test/java/           # 37 Unit, Parameterized, Validation & Integration Tests
├── frontend/
│   ├── src/
│   │   ├── api/                 # Strongly typed fetch client (riskApi.ts)
│   │   ├── components/          # Table, Badges, 5x5 Heatmap Matrix, Modals, Drawer
│   │   ├── types/               # TypeScript interfaces & enums
│   │   └── App.tsx              # Reactive state orchestration, filtering & search
│   └── tests/                   # Frontend calculation & severity band unit tests
├── start.sh                     # Concurrent local startup script
└── README.md
```

---

## Quick-Start & Run Instructions (< 5 minutes)

### Prerequisites
- **Java 17+** (e.g. OpenJDK 17)
- **Node.js 18+** & **npm 9+**
- *(Optional)* Maven (or use included `./mvnw`)

### Option 1: One-Command Startup (Recommended)
From the repository root directory, run:
```bash
./start.sh
```
This automatically compiles and starts both the Spring Boot backend on port `8080` and the Vite frontend on port `3000`.

### Option 2: Run Backend & Frontend Separately

**1. Start the Backend:**
```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@17   # Or your local JDK 17 path
mvn spring-boot:run
```
*Backend runs at `http://localhost:8080`. Sample data is automatically seeded on startup.*

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000` (proxies `/api` calls directly to `8080`).*

---

## Endpoints & Interactive Documentation

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Risk Dashboard UI** | [http://localhost:3000](http://localhost:3000) | Full React/TypeScript Risk Register Application |
| **Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive OpenAPI 3.0 Documentation |
| **OpenAPI JSON Spec** | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) | Machine-readable API schema |
| **H2 Database Console** | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | JDBC URL: `jdbc:h2:mem:riskdb`, User: `sa`, Password: *(empty)* |

---

## Running the Automated Test Suites

All tests run via single documented commands:

### Backend Tests (37 tests)
```bash
cd backend
mvn test
```
**Test Coverage Includes:**
- `RiskScoringServiceTest`: Unit & parameterized tests covering Inherent Risk calculation, Residual Risk compounding, Severity Band classification, and all 3 mathematical sanity checks.
- `RiskServiceBusinessRuleTest`: Unit tests verifying that closing an unmitigated risk is rejected, and preventing deletion of the sole control on a closed risk.
- `RiskControllerValidationTest`: HTTP mock tests verifying that inputs $< 1$ or $> 5$, blank descriptions, and malformed enums receive clean `400 Bad Request` responses with field-level errors.
- `RiskManagementApiIntegrationTest`: End-to-end integration test creating a risk $\rightarrow$ adding a mitigation $\rightarrow$ verifying updated residual score $\rightarrow$ verifying closed status rules.

### Frontend Tests (6 tests)
```bash
cd frontend
npm test
```
Verifies client-side calculation fidelity, sanity checks, and severity mappings.

---

## Residual Risk Formula & Scoring Logic

### 1. Inherent Risk Score
$$\text{Inherent Risk} = \text{Likelihood} \times \text{Impact} \quad (\text{Range: } 1 - 25)$$
- Likelihood $\in [1, 5]$ (Rare $\rightarrow$ Almost Certain)
- Impact $\in [1, 5]$ (Negligible $\rightarrow$ Catastrophic)

### 2. Severity Bands
Standardized across inherent and residual scores:
- **Low:** $1 - 5$ (Emerald)
- **Medium:** $6 - 12$ (Amber)
- **High:** $13 - 19$ (Orange)
- **Critical:** $20 - 25$ (Rose)

### 3. Proposed Residual Risk Formula: Compounding Multiplicative Retention

#### Domain Problem
A common novice mistake in risk modeling is **linear subtraction** (e.g. $\text{Inherent} - \sum \text{Effectiveness}$). Linear subtraction quickly produces negative or zero risk, fails to account for diminishing returns, and implies that five basic procedural memos eliminate a catastrophe.

In real-world risk management (NIST SP 800-30, ISO 27005, and defense-in-depth architecture), controls act as layered barriers. Each control has an unmitigated failure rate. Multiple controls compound with **diminishing marginal returns**.

#### Mathematical Formulation
Each mitigating control $k$ has an effectiveness $e_k \in \{1, 2, 3, 4, 5\}$.
Each effectiveness point reduces risk exposure by $15\%$, leaving a retention factor of:
$$\text{retention}(e_k) = 1.0 - (e_k \times 0.15)$$
- $e = 1$ (Informal / Weak): Retains $85\%$ of the risk ($15\%$ reduction).
- $e = 3$ (Standard Procedure): Retains $55\%$ of the risk ($45\%$ reduction).
- $e = 5$ (Automated / Continuously Monitored): Retains $25\%$ of the risk ($75\%$ reduction).

When multiple controls are applied:
$$\text{Retention}_{\text{compound}} = \prod_{k=1}^n \left(1.0 - e_k \times 0.15\right)$$

Because organizational risks in active operations can virtually never be $100\%$ eliminated to zero, we enforce an unmitigated retention floor of $10\%$ (maximum $90\%$ mitigation reduction):
$$\text{Factor}_{\text{effective}} = \max\left(0.10, \text{Retention}_{\text{compound}}\right)$$

The final scores are:
$$\text{Exact Residual Score} = \text{round}_{\text{2 decimals}}(\text{Inherent} \times \text{Factor}_{\text{effective}})$$
$$\text{Residual Score (Integer)} = \max\left(1, \min\left(\text{Inherent}, \text{round}(\text{Inherent} \times \text{Factor}_{\text{effective}})\right)\right)$$

#### Verification of Prompt Sanity Checks
1. **Zero Mitigations ($n = 0$):**
   The product over an empty set is $1.0$.
   $$\text{Residual} = \text{Inherent} \times 1.0 = \text{Inherent} \quad \checkmark$$
2. **One Highly Effective Mitigation ($e = 5$):**
   Retention is $1.0 - (5 \times 0.15) = 0.25$ ($75\%$ reduction).
   - Critical Inherent $25 \rightarrow \text{round}(25 \times 0.25) = 6$ (**Medium**)
   - Critical Inherent $20 \rightarrow \text{round}(20 \times 0.25) = 5$ (**Low**)
   - Meaningfully lower than inherent in every case. $\checkmark$
3. **Score Never Falls Below 1:**
   Enforced both by the $10\%$ retention floor and the explicit lower bound $\max(1, \dots)$. Even a risk with Inherent score $2$ and four level-5 controls results in Residual score $1$. $\checkmark$

---

## Business Rule Decision: Closing Risks Without Mitigations

### The Judgment Call
> *"Decide what should happen if someone tries to mark a risk 'Closed' while it has zero mitigations. Implement whatever rule you think is correct for a compliance product, and explain your reasoning in the README."*

### Our Implementation & Reasoning
In Hyperproof and compliance auditing (SOC 2, ISO 27001, FedRAMP):
1. **Why Closing Without Mitigations is Rejected:**
   Marking an organizational risk "Closed" without mitigating controls means a risk has been resolved in name only, without an audit trail of active controls, compensating safeguards, or formal risk acceptance. In an external audit, an auditor reviewing closed risks with zero associated controls will issue a control deficiency or unverified exception.
2. **The Enforced Rule:**
   - A user **cannot transition a risk to `Closed` status if it has 0 mitigations.**
   - A user **cannot create a new risk directly in `Closed` status.**
   - If a risk is currently in `Closed` status, a user **cannot delete its last remaining mitigation** without first reopening the risk.
3. **Error Feedback:**
   The API rejects the request with HTTP **`422 Unprocessable Entity`** and an informative message:
   > *"Cannot mark risk as Closed because it has zero mitigating controls. In compliance management, a risk must have at least one active control or documented acceptance mitigation before it can be closed."*

---

## Key Assumptions & Trade-offs

1. **Database Persistence (H2 default vs. PostgreSQL ready):**
   - *Trade-off:* H2 in-memory is configured by default so anyone reviewing the project can run `./start.sh` or `mvn test` in under 2 minutes without provisioning a local PostgreSQL server.
   - *Production Readiness:* A complete `application-postgres.properties` profile and PostgreSQL driver dependency are included. Running with `-Dspring-boot.run.profiles=postgres` connects to PostgreSQL seamlessly.
2. **Dynamic On-the-Fly Risk Scoring:**
   - *Decision:* Inherent and residual scores are computed dynamically in `RiskScoringService` during read operations rather than stored statically in database columns.
   - *Rationale:* Eliminates data drift and cache inconsistency when mitigations are added, updated, or deleted.
3. **Both Integer and Exact Decimal Residual Scores:**
   - Integer scores ($1 - 25$) map directly to severity bands (Low, Medium, High, Critical).
   - Exact decimal scores (e.g. $6.25$ vs $5.50$) allow fine-grained sorting so ties are resolved accurately on the dashboard.
4. **Interactive 5×5 Risk Matrix Heatmap:**
   - Embedded in the risk detail view to visually plot the inherent position ($I$) alongside the residual position ($R$).

---

## What I'd Do Differently or Add With More Time

1. **Audit Trail & Event Sourcing (Hibernate Envers):**
   Record an immutable history of every score revision, who changed likelihood or impact, and what control evidence was attached, providing auditors a point-in-time snapshot.
2. **Automated Evidence Collection:**
   Integrate automated evidence monitors (e.g. GitHub branch protection rules, AWS CloudTrail logging checks) that periodically verify control effectiveness automatically.
3. **Custom Risk Weighting & Financial Quantification (FAIR Model):**
   Allow enterprise customers to define custom risk scoring models (e.g., Dollar-loss exposure vs qualitative Likelihood $\times$ Impact).
4. **Role-Based Access Control (RBAC):**
   Differentiate roles between *Risk Owners* (can propose mitigations), *Compliance Officers* (can approve risk closure), and *Auditors* (read-only export mode).
