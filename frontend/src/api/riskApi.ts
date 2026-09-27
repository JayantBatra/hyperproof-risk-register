import {
  Risk,
  CreateRiskPayload,
  UpdateRiskPayload,
  Mitigation,
  CreateMitigationPayload,
  UpdateMitigationPayload,
  RiskCategory,
  RiskStatus,
  ApiError
} from '../types/risk';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return {} as T;
  }

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const error: ApiError = {
      status: res.status,
      error: (data && data.error) || res.statusText || 'Error',
      message: (data && data.message) || (typeof data === 'string' ? data : 'An unexpected error occurred'),
      validationErrors: data && data.validationErrors,
    };
    throw error;
  }

  return data as T;
}

export const riskApi = {
  async getRisks(params?: {
    category?: RiskCategory | '';
    status?: RiskStatus | '';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Risk[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    const url = `${API_BASE}/risks${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Risk[]>(res);
  },

  async getRiskById(id: number): Promise<Risk> {
    const res = await fetch(`${API_BASE}/risks/${id}`);
    return handleResponse<Risk>(res);
  },

  async createRisk(payload: CreateRiskPayload): Promise<Risk> {
    const res = await fetch(`${API_BASE}/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Risk>(res);
  },

  async updateRisk(id: number, payload: UpdateRiskPayload): Promise<Risk> {
    const res = await fetch(`${API_BASE}/risks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Risk>(res);
  },

  async deleteRisk(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/risks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  async createMitigation(riskId: number, payload: CreateMitigationPayload): Promise<Mitigation> {
    const res = await fetch(`${API_BASE}/risks/${riskId}/mitigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Mitigation>(res);
  },

  async updateMitigation(
    riskId: number,
    mitigationId: number,
    payload: UpdateMitigationPayload
  ): Promise<Mitigation> {
    const res = await fetch(`${API_BASE}/risks/${riskId}/mitigations/${mitigationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Mitigation>(res);
  },

  async deleteMitigation(riskId: number, mitigationId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/risks/${riskId}/mitigations/${mitigationId}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },
};
