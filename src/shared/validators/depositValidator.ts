import { AuthError } from '@/shared/errors';
import type { CreateDepositRequest, DepositStatus } from '@/shared/types/deposits';
import { findWasteCategory } from '@/shared/wasteCategories';

export const DepositLimits = {
  minWeightKg: 0.1,
  maxWeightKg: 100,
  noteMax: 120,
} as const;

/** Dipakai di client (umpan balik cepat) dan di server (sumber kebenaran). */
export class DepositValidator {
  static validateCreate(input: Record<string, unknown>): CreateDepositRequest {
    const category = typeof input.categoryId === 'string' ? findWasteCategory(input.categoryId) : undefined;
    if (!category) throw new AuthError('Pilih kategori sampah.', 'VALIDATION');

    const weightKg = typeof input.weightKg === 'number' ? input.weightKg : Number.NaN;
    if (!Number.isFinite(weightKg) || weightKg < DepositLimits.minWeightKg || weightKg > DepositLimits.maxWeightKg) {
      throw new AuthError(
        `Berat harus antara ${DepositLimits.minWeightKg} dan ${DepositLimits.maxWeightKg} kg.`,
        'VALIDATION',
      );
    }

    let note: string | undefined;
    if (input.note !== undefined && input.note !== null) {
      if (typeof input.note !== 'string') throw new AuthError('Catatan tidak valid.', 'VALIDATION');
      note = input.note.trim();
      if (note.length > DepositLimits.noteMax) {
        throw new AuthError(`Catatan maksimal ${DepositLimits.noteMax} karakter.`, 'VALIDATION');
      }
      if (/[\u0000-\u001f\u007f<>]/.test(note)) {
        throw new AuthError('Catatan mengandung karakter yang tidak diizinkan.', 'VALIDATION');
      }
    }

    // Dibulatkan ke 0,1 kg agar konsisten dengan timbangan bank sampah.
    return { categoryId: category.id, weightKg: Math.round(weightKg * 10) / 10, note: note || undefined };
  }

  static validateStatus(input: Record<string, unknown>): DepositStatus {
    if (input.status !== 'scheduled' && input.status !== 'completed') {
      throw new AuthError('Status setoran tidak valid.', 'VALIDATION');
    }
    return input.status;
  }
}
