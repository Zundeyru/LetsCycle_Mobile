/// <reference types="node" />
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { IPhotoFileStorage } from '@/server/repositories/types';

// Hanya nama yang dibuat server sendiri yang diterima: mencegah path traversal.
const safeFileName = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export class LocalPhotoStorage implements IPhotoFileStorage {
  constructor(private readonly directory: string) {}

  async save(fileName: string, bytes: Uint8Array): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.resolve(fileName), bytes, { mode: 0o600, flag: 'wx' });
  }

  async read(fileName: string): Promise<Uint8Array> {
    return new Uint8Array(await readFile(this.resolve(fileName)));
  }

  async delete(fileName: string): Promise<void> {
    await rm(this.resolve(fileName), { force: true });
  }

  private resolve(fileName: string): string {
    if (!safeFileName.test(fileName)) throw new Error(`Nama file foto tidak valid: ${fileName}`);
    return path.join(this.directory, fileName);
  }
}
