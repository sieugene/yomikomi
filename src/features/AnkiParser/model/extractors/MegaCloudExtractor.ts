import { File, MutableFile } from "megajs";
import { parseAnkiMediaJson } from "../../lib/parseAnkiMediaJson";
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
    const file = await this.findFileByName(fileName);
    const data = (await file.downloadBuffer({})) as unknown as ArrayBuffer;
    return data;
  }

  async extractMedia(fileName: string): Promise<Record<string, string>> {
    const file = await this.findFileByName(fileName);
    const readableStream = await file.download({});

    const mediaFile = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on("data", (chunk: Buffer<ArrayBufferLike>) =>
        chunks.push(chunk)
      );
      readableStream.on("end", () =>
        resolve(Buffer.concat(chunks).toString("utf-8"))
      );
      readableStream.on("error", (error: any) => reject(error));
    });
    return parseAnkiMediaJson(mediaFile);
  }

  async listFiles(): Promise<string[]> {
    return (
      this.selectedFile?.children?.map((file) =>
        !!file.name ? file.name : ""
      ) || []
    );
  }

  private async findFileByName(fileName: string): Promise<MutableFile> {
    if (!this.selectedFile) {
      throw new Error("No file selected");
    }
    const file = this.selectedFile.find((node) => node.name === fileName);
    if (!file) {
      throw new Error(`File ${fileName} not found`);
    }
    return file as MutableFile;
  }
}
