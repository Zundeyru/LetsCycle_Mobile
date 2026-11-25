import { AuthError } from '@/shared/errors';
import type { DepositDto } from '@/shared/types/deposits';
import { DepositValidator } from '@/shared/validators/depositValidator';
import { findWasteCategory } from '@/shared/wasteCategories';
import { ServerConfig } from '@/server/config';
import type { StoredDeposit } from '@/server/db/JsonDatabase';
import type { IDepositRepository } from '@/server/repositories/types';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function toDepositDto(deposit: StoredDeposit): DepositDto {
  const pricePerKg = findWasteCategory(deposit.categoryId)?.pricePerKg ?? null;
  return {
    id: deposit.id,
    categoryId: deposit.categoryId,
    weightKg: deposit.weightKg,
    note: deposit.note ?? null,
    status: deposit.status,
    // Dihitung di server agar harga per kg tidak bisa dimanipulasi dari client.
    estimatedValue: pricePerKg === null ? null : Math.round(deposit.weightKg * pricePerKg),
    createdAt: deposit.createdAt,
  };
}

function notFound(): AuthError {
  // Sama untuk "tidak ada" dan "milik orang lain" agar ID setoran orang lain tidak bisa ditebak.
  return new AuthError('Setoran tidak ditemukan.', 'NOT_FOUND');
}

export class DepositService {
  constructor(private readonly deposits: IDepositRepository) {}

  async list(userId: string): Promise<DepositDto[]> {
    return (await this.deposits.listByUser(userId)).map(toDepositDto);
  }

  async create(userId: string, input: Record<string, unknown>): Promise<DepositDto> {
    const { categoryId, weightKg, note } = DepositValidator.validateCreate(input);
    const now = new Date().toISOString();
    const deposit: StoredDeposit = {
      id: crypto.randomUUID(),
      userId,
      categoryId,
      weightKg,
      note,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    await this.deposits.create(deposit, ServerConfig.deposits.maxPerUser);
    return toDepositDto(deposit);
  }

  async updateStatus(userId: string, id: string, input: Record<string, unknown>): Promise<DepositDto> {
    if (!uuidPattern.test(id)) throw notFound();
    const updated = await this.deposits.updateStatus(userId, id, DepositValidator.validateStatus(input));
    if (!updated) throw notFound();
    return toDepositDto(updated);
  }
}
