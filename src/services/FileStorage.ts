import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';

import sessionSeed from '@/data/session.txt';
import usersSeed from '@/data/users.txt';
import type { IFileStorage } from '@/types/IFileStorage';

const seedAssets: Record<string, number> = {
  'users.txt': usersSeed,
  'session.txt': sessionSeed,
};

export class FileStorage implements IFileStorage {
  private readonly documents = Paths.document;

  async initialize(): Promise<void> {
    this.documents.create({ idempotent: true });
    await Promise.all(
      Object.entries(seedAssets).map(async ([fileName, assetId]) => {
        const destination = new File(this.documents, fileName);
        if (destination.exists) return;

        const asset = Asset.fromModule(assetId);
        await asset.downloadAsync();
        if (!asset.localUri) {
          throw new Error(`Aset seed ${fileName} tidak tersedia secara lokal.`);
        }
        await new File(asset.localUri).copy(destination);
      }),
    );
  }

  async read(fileName: string): Promise<string> {
    return new File(this.documents, fileName).text();
  }

  async write(fileName: string, content: string): Promise<void> {
    const file = new File(this.documents, fileName);
    if (!file.exists) file.create({ intermediates: true });
    file.write(content);
  }
}
