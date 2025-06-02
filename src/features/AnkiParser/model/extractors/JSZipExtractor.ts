import JSZip from "jszip";
import { Extractor } from "../Extractor";
import protobuf from "protobufjs";
import { PROTO_IMPORT_EXPORT } from "@/shared/lib/parser/protos";
import { init as ZstdInit, decompress } from "@bokuweb/zstd-wasm";

export class JSZipExtractor implements Extractor {
  private zip: JSZip;

  constructor(private file: File) {
    this.zip = new JSZip();
  }

  async init(): Promise<void> {
    await this.zip.loadAsync(this.file);
  }

  private async initZstd(): Promise<void> {
    await ZstdInit();
  }

  async listFiles(): Promise<string[]> {
    return Object.keys(this.zip.files);
  }

  async extractFile(fileName: string): Promise<ArrayBuffer | null> {
    this.ensureSafePath(fileName);
    const file = this.zip.file(fileName);
    return file ? file.async("arraybuffer") : null;
  }

  private isZstdCompressed(buf: Uint8Array): boolean {
    return (
      buf.length >= 4 &&
      buf[0] === 0x28 &&
      buf[1] === 0xb5 &&
      buf[2] === 0x2f &&
      buf[3] === 0xfd
    );
  }

  private async decompressZstdIfNeeded(buf: Uint8Array): Promise<Uint8Array> {
    if (this.isZstdCompressed(buf)) {
      console.log("Detected Zstandard compressed data, decompressing...");

      try {
        await this.initZstd();
        const decompressed = decompress(buf);
        console.log(
          `Decompressed ${buf.length} bytes -> ${decompressed.length} bytes`
        );
        return decompressed;
      } catch (e) {
        console.error("Zstd decompression failed:", e);
        throw new Error(
          `Zstandard decompression failed: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }
    return buf;
  }

  async extractMedia(fileName: string): Promise<Record<string, string>> {
    this.ensureSafePath(fileName);

    const file = this.zip.file(fileName);
    if (!file) {
      throw new Error(`File ${fileName} not found in archive`);
    }

    let buf: Uint8Array;
    try {
      buf = await file.async("uint8array");
      console.log(`Extracted ${fileName} (${buf.length} bytes)`);

      buf = await this.decompressZstdIfNeeded(buf);
    } catch (e) {
      console.error("Failed to process media file:", e);
      return {};
    }

    // Try to parse as JSON
    try {
      const str = new TextDecoder().decode(buf);
      const json = JSON.parse(str);
      console.log("Parsed media as JSON");
      return json;
    } catch {
      console.log("Media is not JSON. Trying protobuf...");
    }

    // Fallback to protobuf decoding
    try {
      const root = protobuf.Root.fromJSON(PROTO_IMPORT_EXPORT);
      const MediaEntries = root.lookupType("anki.import_export.MediaEntries");
      const message = MediaEntries.decode(buf);
      const json = message.toJSON();

      if (!json || typeof json !== "object" || !Array.isArray(json.entries)) {
        throw new Error("Invalid protobuf structure for MediaEntries");
      }

      const result: Record<string, string> = {};
      for (const i in json.entries) {
        result[i] = String(json.entries[i]?.name ?? "");
      }

      return result;
    } catch (e: any) {
      console.error(
        `Protobuf decode failed for ${fileName}. First bytes:`,
        Array.from(buf.slice(0, 16))
      );
      console.error("Full error:", e);
      return {};
    }
  }

  private ensureSafePath(fileName: string): void {
    if (fileName.includes("..") || fileName.startsWith("/")) {
      throw new Error(`Suspicious file path detected: ${fileName}`);
    }
  }

  async validateZipStructure(): Promise<void> {
    const files = await this.listFiles();
    const requiredFiles = [
      "collection.anki21b", // newest format first
      "collection.anki21",
      "collection.anki2",
      "media",
    ];

    const hasAnyCollection = requiredFiles.some((f) => files.includes(f));
    if (!hasAnyCollection) {
      throw new Error(
        "Not a valid Anki deck (missing collection or media file)"
      );
    }
  }
}
