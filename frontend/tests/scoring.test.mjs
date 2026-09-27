import test from 'node:test';
import assert from 'node:assert/strict';

// Core scoring logic mirroring backend implementation
function calculateInherentScore(likelihood, impact) {
  if (likelihood < 1 || likelihood > 5 || impact < 1 || impact > 5) {
    throw new Error('Likelihood and Impact must be integers between 1 and 5');
  }
  return likelihood * impact;
}

function getSeverityBand(score) {
  if (score <= 5) return 'Low';
  if (score <= 12) return 'Medium';
  if (score <= 19) return 'High';
  return 'Critical';
}

function calculateResidualScore(inherentScore, mitigations = []) {
  if (!mitigations || mitigations.length === 0) {
    return inherentScore;
  }

  let retentionProduct = 1.0;
  for (const m of mitigations) {
    if (m.effectiveness < 1 || m.effectiveness > 5) {
      throw new Error('Mitigation effectiveness must be between 1 and 5');
    }
    const retention = 1.0 - (m.effectiveness * 0.15);
    retentionProduct *= retention;
  }

  // Minimum retention floor of 0.10 (max 90% mitigation)
  const effectiveFactor = Math.max(0.10, retentionProduct);
  const raw = inherentScore * effectiveFactor;
  const rounded = Math.round(raw);
  return Math.max(1, Math.min(inherentScore, rounded));
}

test('Frontend Scoring: Inherent Risk Score = Likelihood × Impact', () => {
  assert.equal(calculateInherentScore(1, 1), 1);
  assert.equal(calculateInherentScore(3, 4), 12);
  assert.equal(calculateInherentScore(4, 5), 20);
  assert.equal(calculateInherentScore(5, 5), 25);
  assert.throws(() => calculateInherentScore(0, 5));
  assert.throws(() => calculateInherentScore(3, 6));
});

test('Frontend Scoring: Severity Band Mapping', () => {
  assert.equal(getSeverityBand(1), 'Low');
  assert.equal(getSeverityBand(5), 'Low');
  assert.equal(getSeverityBand(6), 'Medium');
  assert.equal(getSeverityBand(12), 'Medium');
  assert.equal(getSeverityBand(13), 'High');
  assert.equal(getSeverityBand(19), 'High');
  assert.equal(getSeverityBand(20), 'Critical');
  assert.equal(getSeverityBand(25), 'Critical');
});

test('Frontend Scoring: Sanity Check 1 - Zero mitigations leaves residual = inherent', () => {
  const inherent = 20;
  assert.equal(calculateResidualScore(inherent, []), 20);
  assert.equal(calculateResidualScore(inherent, null), 20);
});

test('Frontend Scoring: Sanity Check 2 - One highly effective mitigation (5) meaningfully reduces inherent', () => {
  const inherent = 25;
  const mitigations = [{ description: 'Automated Zero Trust', effectiveness: 5 }];
  const residual = calculateResidualScore(inherent, mitigations);
  // 25 * 0.25 = 6.25 -> 6 (Medium)
  assert.equal(residual, 6);
  assert.equal(getSeverityBand(residual), 'Medium');
  assert.ok(residual < inherent);
});

test('Frontend Scoring: Sanity Check 3 - Residual score never falls below 1', () => {
  const inherent = 2;
  const heavyMitigations = [
    { description: 'Control A', effectiveness: 5 },
    { description: 'Control B', effectiveness: 5 },
    { description: 'Control C', effectiveness: 5 }
  ];
  const residual = calculateResidualScore(inherent, heavyMitigations);
  assert.equal(residual, 1);
});

test('Frontend Scoring: Compounding diminishing returns with multiple mitigations', () => {
  const inherent = 25;
  const m1 = [{ description: 'Control 1', effectiveness: 4 }];
  const m2 = [
    { description: 'Control 1', effectiveness: 4 },
    { description: 'Control 2', effectiveness: 3 }
  ];
  const res1 = calculateResidualScore(inherent, m1); // 25 * 0.4 = 10
  const res2 = calculateResidualScore(inherent, m2); // 25 * 0.4 * 0.55 = 5.5 -> 6
  assert.equal(res1, 10);
  assert.equal(res2, 6);
  assert.ok(res2 < res1);
});
