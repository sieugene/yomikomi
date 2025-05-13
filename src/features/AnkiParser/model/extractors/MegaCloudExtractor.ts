import { File } from "megajs";
import { Extractor } from "../Extractor";

export class MegaCloudExtractor implements Extractor {
  private selectedFile: File | null = null;
  constructor(private url: string) {}

  async init(): Promise<void> {
    try {
      const mainFile = File.fromURL(this.url);
      mainFile.api.userAgent = "MEGAJS-Demos (+https://mega.js.org/)";
      const attributes = await mainFile.loadAttributes();

      if (!attributes) {
        throw new Error("Failed to load file attributes");
      }
      this.selectedFile = attributes;
    } catch (error) {
      console.error("Error initializing MegaCloudExtractor:", error);
    }
  }

  async extractFile(fileName: string): Promise<ArrayBuffer | null> {
    if (!this.selectedFile) {
      throw new Error("No file selected");
    }
    const file = this.selectedFile.find((node) => node.name === fileName);
    if (!file) {
      throw new Error(`File ${fileName} not found`);
    }
    const data = (await file.downloadBuffer({})) as unknown as ArrayBuffer;
    return data;
  }

  async extractText(fileName: string): Promise<string | null> {
    return `{}`;
  }

  async listFiles(): Promise<string[]> {
    return (
      this.selectedFile?.children?.map((file) =>
        !!file.name ? file.name : ""
      ) || []
    );
  }
}
