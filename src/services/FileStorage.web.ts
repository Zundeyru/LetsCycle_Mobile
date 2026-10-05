import type { IFileStorage } from '@/types/IFileStorage';

const storagePrefix = 'letcycle:';
const seedFiles = ['users.txt', 'session.txt'] as const;

export class FileStorage implements IFileStorage {
  async initialize(): Promise<void> {
    for (const fileName of seedFiles) {
      const key = `${storagePrefix}${fileName}`;
      if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, '');
    }
  }

  async read(fileName: string): Promise<string> {
    const content = window.localStorage.getItem(`${storagePrefix}${fileName}`);
    if (content === null) throw new Error(`File ${fileName} belum diinisialisasi.`);
    return content;
  }

  async write(fileName: string, content: string): Promise<void> {
    window.localStorage.setItem(`${storagePrefix}${fileName}`, content);
  }
}
