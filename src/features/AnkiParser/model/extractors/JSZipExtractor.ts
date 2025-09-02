import JSZip from "jszip";
import { Extractor } from "../Extractor";
import protobuf from "protobufjs";
import { PROTO_IMPORT_EXPORT } from "@/features/AnkiParser/lib/parser/protos";
import initDWebZstdModule, { decompress } from "@dweb-browser/zstd-wasm";

const initDWebZstd = initDWebZstdModule as unknown as (
  wasmPath: string
) => Promise<void>;

export class JSZipExtractor implements Extractor {
  private zip: JSZip;

  constructor(private file: File) {
    this.zip = new JSZip();
  }

  async init(): Promise<void> {
    await this.zip.loadAsync(this.file);
  }

  // TODO
  private async initZstd(): Promise<void> {
    await initDWebZstd("/zstd/zstd_wasm_bg.wasm");
  }

  async listFiles(): Promise<string[]> {
    return Object.keys(this.zip.files);
  }

  async extractFile(fileName: string): Promise<ArrayBuffer | null> {
    this.ensureSafePath(fileName);
    const file = this.zip.file(fileName);
    try {
      if (file) {
        const arrayBuffer = await file.async("arraybuffer");
        const compressed = new Uint8Array(arrayBuffer);
        await this.initZstd();
        const input = decompress(compressed);

        return input as unknown as ArrayBuffer;
      }
    } catch {
      return file ? file.async("arraybuffer") : null;
    }
    return null;
  }

  private async decompressIfNeeded(buf: Uint8Array): Promise<Uint8Array> {
    try {
      return decompress(buf);
    } catch {
      return buf;
    }
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
      buf = await this.decompressIfNeeded(buf);
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
    } catch (e) {
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
}
