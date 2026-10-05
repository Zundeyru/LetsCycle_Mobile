export interface IFileStorage {
  initialize(): Promise<void>;
  read(fileName: string): Promise<string>;
  write(fileName: string, content: string): Promise<void>;
}
