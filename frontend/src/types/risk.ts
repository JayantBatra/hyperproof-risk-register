export type RiskCategory = 'Operational' | 'Financial' | 'Compliance' | 'Security' | 'Strategic';

export type RiskStatus = 'Open' | 'Mitigating' | 'Closed';

export type SeverityBand = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Mitigation {
  id: number;
  riskId: number;
  description: string;
  effectiveness: number; // 1-5
  createdAt: string;
}

export interface Risk {
  id: number;
  title: string;
  description?: string;
  category: RiskCategory;
  owner?: string;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  status: RiskStatus;
  inherentScore: number;
  inherentSeverity: SeverityBand;
  residualScore: number;
  exactResidualScore: number;
  residualSeverity: SeverityBand;
  mitigationPercentage: number;
  mitigationCount: number;
  mitigations: Mitigation[];
  nextReviewDate?: string;
  overdue?: boolean;
  complianceFrameworks?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskPayload {
  title: string;
  description?: string;
  category: RiskCategory;
  owner?: string;
  likelihood: number;
  impact: number;
  status: RiskStatus;
  nextReviewDate?: string;
  complianceFrameworks?: string[];
}

export interface UpdateRiskPayload {
  title: string;
  description?: string;
  category: RiskCategory;
  owner?: string;
  likelihood: number;
  impact: number;
  status: RiskStatus;
  nextReviewDate?: string;
  complianceFrameworks?: string[];
}

export interface CreateMitigationPayload {
  description: string;
  effectiveness: number; // 1-5
}

export interface UpdateMitigationPayload {
  description: string;
  effectiveness: number; // 1-5
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  validationErrors?: Record<string, string>;
}
