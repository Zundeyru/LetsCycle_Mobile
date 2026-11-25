import { AuthError } from '@/shared/errors';
import type { DepositStatus } from '@/shared/types/deposits';
import type { JsonDatabase, StoredDeposit } from '@/server/db/JsonDatabase';
import type { IDepositRepository } from '@/server/repositories/types';

export class DepositRepository implements IDepositRepository {
  constructor(private readonly db: JsonDatabase) {}

  listByUser(userId: string): Promise<StoredDeposit[]> {
    return this.db.read((data) =>
      data.deposits
        .filter((deposit) => deposit.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  create(deposit: StoredDeposit, maxPerUser: number): Promise<void> {
    return this.db.transaction((data) => {
      if (data.deposits.filter((saved) => saved.userId === deposit.userId).length >= maxPerUser) {
        throw new AuthError(`Batas ${maxPerUser} catatan setoran tercapai.`, 'QUOTA_EXCEEDED');
      }
      data.deposits.push(deposit);
    });
  }

  updateStatus(userId: string, id: string, status: DepositStatus): Promise<StoredDeposit | null> {
    return this.db.transaction((data) => {
      const deposit = data.deposits.find((saved) => saved.id === id && saved.userId === userId);
      if (!deposit) return null;
      deposit.status = status;
      deposit.updatedAt = new Date().toISOString();
      return { ...deposit };
    });
  }
}
