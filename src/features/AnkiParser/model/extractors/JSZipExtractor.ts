import JSZip from "jszip";
import { Extractor } from "../Extractor";

export class JSZipExtractor implements Extractor {
  private zip: JSZip;

  constructor(private file: File) {
    this.zip = new JSZip();
  }

  async init(): Promise<void> {
    await this.zip.loadAsync(this.file);
  }

  async extractFile(fileName: string): Promise<ArrayBuffer | null> {
    const file = this.zip.file(fileName);
    return file ? file.async("arraybuffer") : null;
  }

  async extractText(fileName: string): Promise<string | null> {
    const file = this.zip.file(fileName);
    return file ? file.async("string") : null;
  }

  async listFiles(): Promise<string[]> {
    return Object.keys(this.zip.files);
  }
}
