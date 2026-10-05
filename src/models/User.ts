import { AuthError } from '@/types/AuthError';

export class User {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly email: string,
    private readonly passwordHash: string,
    private readonly createdAt: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  toLine(): string {
    return [this.id, this.name, this.email, this.passwordHash, this.createdAt].join('|');
  }

  static fromLine(line: string): User {
    const fields = line.split('|');
    if (fields.length !== 5 || fields.some((field) => field.length === 0)) {
      throw new AuthError('Format data akun tidak valid.', 'DATA_CORRUPT');
    }

    const [id, name, email, passwordHash, createdAt] = fields;
    return new User(id, name, email, passwordHash, createdAt);
  }
}
