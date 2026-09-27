# Hyperproof Reviewer Evaluation Guide

Welcome! This guide is curated specifically for the **Hyperproof Engineering Hiring Team** to review and evaluate this take-home project in **under 5 minutes**.

---

## 1. Quick Reference & Links

- **Repository:** [https://github.com/JayantBatra/hyperproof-risk-register](https://github.com/JayantBatra/hyperproof-risk-register)
- **Primary Documentation:** [`README.md`](README.md)
- **Deep-Dive System Architecture:** [`SYSTEM_DESIGN_AND_ARCHITECTURE.md`](SYSTEM_DESIGN_AND_ARCHITECTURE.md)
- **Local Application URL:** [http://localhost:3000](http://localhost:3000)
- **Swagger OpenAPI Documentation:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **H2 Database Console:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:riskdb`, User: `sa`, Password: empty)

---

## 2. Five-Minute Verification Script

### Step 1: Run Backend Automated Tests (37 Tests)
Run from the root directory:
```bash
cd backend
mvn test
```
*Expected output: `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` in ~3.5 seconds.*

**Key test files to inspect:**
- [`RiskScoringServiceTest.java`](backend/src/test/java/com/hyperproof/risk/service/RiskScoringServiceTest.java) — Unit & parameterized tests covering Inherent Risk calculation, Residual Risk compounding, Severity Band classification, and all 3 mathematical sanity checks.
- [`RiskServiceBusinessRuleTest.java`](backend/src/test/java/com/hyperproof/risk/service/RiskServiceBusinessRuleTest.java) — Verifies closure constraints and sole mitigation protection.
- [`RiskControllerValidationTest.java`](backend/src/test/java/com/hyperproof/risk/controller/RiskControllerValidationTest.java) — Verifies that inputs outside `1–5`, empty titles, or malformed data return `400 Bad Request` with field errors.
- [`RiskManagementApiIntegrationTest.java`](backend/src/test/java/com/hyperproof/risk/integration/RiskManagementApiIntegrationTest.java) — Full lifecycle integration test: Create risk $\rightarrow$ Add mitigation $\rightarrow$ Verify residual score drop $\rightarrow$ Attempt closure $\rightarrow$ Test deletion guard.

### Step 2: Run Frontend Automated Tests (6 Tests)
Run from the root directory:
```bash
cd frontend
npm test
```
*Expected output: `pass 6, fail 0` in ~50 milliseconds.*

### Step 3: Start the Application (One Command)
From the repository root:
```bash
./start.sh
```
Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 3. Interactive UI Evaluation Walkthrough

Follow these 4 quick steps in the browser to verify all assignment criteria:

### A. View the Risk Register Dashboard
1. The dashboard opens pre-populated with **7 realistic sample risks** across Security, Operational, Compliance, Strategic, and Financial categories.
2. Note that risks are **sorted by Residual Score descending by default** (e.g. Unmitigated Critical Risk at score 20 appears first).
3. Severity bands are color-coded at a glance:
   - **Low (1–5):** Emerald Green
   - **Medium (6–12):** Amber
   - **High (13–19):** Orange
   - **Critical (20–25):** Rose Red
4. Test filtering by **Category** or **Status**, and toggle sort order via the sort controls.

### B. Test Live Scoring in the "Create Risk" Form
1. Click **"+ New Risk"** in the top right.
2. Observe the **Inherent Risk Scoring** panel at the bottom of the modal.
3. Change **Likelihood** and **Impact** buttons (1 to 5):
   - Notice that the **Inherent Score** and its **Severity Badge** update **live in real-time** before saving!
4. Enter Title: `"API Credential Exposure"`, Likelihood: `4`, Impact: `5` (Inherent Score = 20, Critical).
5. Click **Create Risk**.

### C. Test Residual Risk Compounding & 5×5 Matrix
1. Click on the newly created risk in the table to open the **Risk Detail Drawer**.
2. Notice the scorecard:
   - Inherent Risk: **20 (Critical)**
   - Residual Risk: **20 (Critical)** — *zero mitigations applied yet*.
   - The **5×5 Risk Matrix** plots an indicator `I` at Likelihood 4, Impact 5.
3. Under **"Add New Mitigating Control"**:
   - Description: `"Automated Secrets Scanner & Pre-Commit Hook"`
   - Effectiveness: Select **5 (Automated & Continuously Monitored)**
   - Click **Apply Mitigation**.
4. **Immediate Result:**
   - Residual Risk instantly drops to **5 (Low)** — a **75% reduction**!
   - The 5×5 Matrix now plots the residual position `R`.
   - The risk status automatically transitions from `Open` to `Mitigating`.

### D. Test the Compliance Business Rule (Closing Risks)
1. In the Risk Detail Drawer, click **Edit Risk Details**.
2. Change the status to **"Closed"** and click **Update Risk**.
   - *This succeeds because the risk has at least one valid mitigating control.*
3. Now, try to delete the sole mitigation by clicking the trash icon next to the control in the drawer.
   - **Expected Result:** Blocked! A red notification banner appears:
     > *"Cannot delete the only mitigating control from a Closed risk. Auditors require at least one mitigating control for closed risks. Please re-open the risk first."*
4. Create or edit an unmitigated risk (0 controls) and attempt to mark it **Closed**.
   - **Expected Result:** Blocked with HTTP **`422 Unprocessable Entity`**:
     > *"Cannot mark risk as Closed because it has zero mitigating controls."*

---

## 4. Evaluation Rubric & Requirement Traceability

| Requirement | Where It Is Implemented | How to Verify |
| :--- | :--- | :--- |
| **Data Model (Risk & Mitigation)** | [`Risk.java`](backend/src/main/java/com/hyperproof/risk/model/Risk.java), [`Mitigation.java`](backend/src/main/java/com/hyperproof/risk/model/Mitigation.java) | Entity relationships, cascading delete, enums for Category, Status, Severity. |
| **REST API Design** | [`RiskController.java`](backend/src/main/java/com/hyperproof/risk/controller/RiskController.java), [`MitigationController.java`](backend/src/main/java/com/hyperproof/risk/controller/MitigationController.java) | Full CRUD, filtering, sorting, Swagger docs at `/swagger-ui.html`. |
| **Input Validation (1–5)** | Jakarta `@Min(1) @Max(5)`, [`GlobalExceptionHandler.java`](backend/src/main/java/com/hyperproof/risk/exception/GlobalExceptionHandler.java) | Run `RiskControllerValidationTest.java` (returns 400 Bad Request with field errors). |
| **Scoring Formula (Inherent & Residual)** | [`RiskScoringService.java`](backend/src/main/java/com/hyperproof/risk/service/RiskScoringService.java) | Formula: $\text{Retention} = \prod (1 - e \times 0.15)$; all 3 sanity checks verified in `RiskScoringServiceTest.java`. |
| **Severity Bands (Low, Medium, High, Critical)** | [`SeverityBand.java`](backend/src/main/java/com/hyperproof/risk/model/SeverityBand.java), [`SeverityBadge.tsx`](frontend/src/components/SeverityBadge.tsx) | Low 1–5, Medium 6–12, High 13–19, Critical 20–25; color-coded in UI and backend. |
| **Business Rule on Closed Risks** | [`RiskService.java`](backend/src/main/java/com/hyperproof/risk/service/RiskService.java), [`MitigationService.java`](backend/src/main/java/com/hyperproof/risk/service/MitigationService.java) | Cannot close with 0 controls (HTTP 422); tested in `RiskServiceBusinessRuleTest.java`. |
| **Database Persistence** | Default H2 in-memory; [`application-postgres.properties`](backend/src/main/resources/application-postgres.properties) | Zero-friction setup; ready for PostgreSQL container via `-Dspring-boot.run.profiles=postgres`. |
| **Automated Tests** | `backend/src/test/java/`, `frontend/tests/` | Single documented commands: `mvn test` (37 tests), `npm test` (6 tests). |
| **Frontend Dashboard, Filters & Sorting** | [`RiskTable.tsx`](frontend/src/components/RiskTable.tsx), [`RiskFilters.tsx`](frontend/src/components/RiskFilters.tsx) | Clean visual table, filter by category/status, sort by residual score. |
| **Live Inherent Score Preview** | [`RiskModal.tsx`](frontend/src/components/RiskModal.tsx) | Real-time score and badge calculation as user adjusts likelihood/impact. |
| **Risk Detail View & Mitigations** | [`RiskDetailDrawer.tsx`](frontend/src/components/RiskDetailDrawer.tsx) | Side drawer showing controls, inline add form, and instant residual recalculation. |
| **Stretch Goals Included** | `Risk.java`, `RiskModal.tsx`, `RiskTable.tsx`, `RiskScoreMatrix.tsx` | Compliance framework tags (SOC 2, NIST CSF); Overdue review badges; 5×5 Matrix heatmap. |

---

## 5. How to Push This Repository to GitHub

If you wish to host this in your own GitHub account:

```bash
# 1. Create a new empty repository on GitHub named 'hyperproof-risk-register' at https://github.com/new
# 2. In your terminal at the project root:
git remote add origin https://github.com/JayantBatra/hyperproof-risk-register.git
git branch -M main
git push -u origin main
```
