import type { WasteCategoryId } from '@/shared/wasteCategories';

export type DepositStatus = 'scheduled' | 'completed';

/** Data setoran yang dikirim ke client. */
export interface DepositDto {
  id: string;
  categoryId: WasteCategoryId;
  weightKg: number;
  note: string | null;
  status: DepositStatus;
  /** Estimasi uang (rupiah) = berat x harga per kg; null bila kategori tanpa harga tetap. */
  estimatedValue: number | null;
  createdAt: string;
}

export interface CreateDepositRequest {
  categoryId: WasteCategoryId;
  weightKg: number;
  note?: string;
}

export interface DepositListResponse {
  deposits: DepositDto[];
}

export interface DepositResponse {
  deposit: DepositDto;
}
