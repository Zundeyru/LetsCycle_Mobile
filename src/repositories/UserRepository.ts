import { User } from '@/models/User';
import type { IFileStorage } from '@/types/IFileStorage';
import type { IUserRepository } from '@/types/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private readonly storage: IFileStorage) {}

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find((user) => user.getEmail() === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find((user) => user.getId() === id) ?? null;
  }

  async save(user: User): Promise<void> {
    const users = await this.readUsers();
    const existingIndex = users.findIndex((saved) => saved.getId() === user.getId());
    if (existingIndex >= 0) users[existingIndex] = user;
    else users.push(user);

    await this.storage.write('users.txt', users.map((saved) => saved.toLine()).join('\n'));
  }

  private async readUsers(): Promise<User[]> {
    const contents = await this.storage.read('users.txt');
    return contents
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => User.fromLine(line));
  }
}
