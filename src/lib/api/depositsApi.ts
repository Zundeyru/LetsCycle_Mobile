import type {
  CreateDepositRequest,
  DepositDto,
  DepositListResponse,
  DepositResponse,
  DepositStatus,
} from '@/shared/types/deposits';

import { apiRequest } from './client';

// Token Bearer disisipkan otomatis oleh request interceptor di client.ts.
export const DepositsApi = {
  /** GET /api/deposits */
  async list(signal?: AbortSignal): Promise<DepositDto[]> {
    return (await apiRequest<DepositListResponse>('/api/deposits', { signal })).deposits;
  },

  /** POST /api/deposits */
  async create(body: CreateDepositRequest): Promise<DepositDto> {
    return (await apiRequest<DepositResponse>('/api/deposits', { method: 'POST', body })).deposit;
  },

  /** PATCH /api/deposits/:id */
  async setStatus(id: string, status: DepositStatus): Promise<DepositDto> {
    return (
      await apiRequest<DepositResponse>(`/api/deposits/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } })
    ).deposit;
  },
};
