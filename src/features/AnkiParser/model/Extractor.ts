export interface Extractor {
  extractFile(fileName: string): Promise<ArrayBuffer | null>;
  extractText(fileName: string): Promise<string | null>;
  listFiles(): Promise<string[]>;
}
