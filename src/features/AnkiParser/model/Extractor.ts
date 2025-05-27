export interface Extractor {
  extractFile(fileName: string): Promise<ArrayBuffer | null>;
  extractMedia(fileName: string): Promise<Record<string, string>>;
  listFiles(): Promise<string[]>;
  getCurrentFile: () => File | null
}
