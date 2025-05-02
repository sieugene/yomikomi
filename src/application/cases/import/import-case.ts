import { Note, Collection } from "@/infrastructure/database/generated";
import { prisma } from "@/infrastructure/database/prisma";
import { StorageService } from "@/infrastructure/storage/storage";
import { ENV } from "@/shared/env";
import { parseApkg } from "@/shared/lib/apkgParser";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { lookup } from "mime-types";
import path, { join } from "path";
import { v4 as uuidv4 } from "uuid";

export type ImportRouteResponse = {
  createdNote: Note;
}[];

export class ImportCase {
  private collectionName: string;
  private file: File;
  private filePath: string;
  private tempDir: string;

  constructor(file: File, collectionName: string) {
    this.file = file;
    const now = Date.now().toString();
    this.filePath = join("/tmp", now, file.name);
    this.tempDir = join("/tmp", `${now}-dir`);
    this.collectionName = collectionName;
  }

  private async saveFile() {
    const fileStream = this.file.stream();
    const reader = fileStream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      if (value) chunks.push(value);
      done = doneReading;
    }

    const fileBuffer = Buffer.concat(chunks);
    mkdirSync(path.dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, fileBuffer);
    mkdirSync(this.tempDir, { recursive: true });
  }

  private async createCollection(collectionName: string): Promise<Collection> {
    const collection = await prisma.collection.create({
      data: {
        name: collectionName,
      },
    });
    return collection;
  }

  private async uploadMedia(
    mediaMap: Record<string, string>,
    collectionId: string
  ) {
    await Promise.all(
      Object.entries(mediaMap).map(async ([index, fileName]) => {
        const mediaFilePath = path.join(this.tempDir, index);
        if (!existsSync(mediaFilePath)) return;

        const uuid = uuidv4();
        const buffer = readFileSync(mediaFilePath);
        const uploadKey = `${uuid}-${fileName}`;
        const mimeType = lookup(fileName) || "application/octet-stream";

        try {
          await StorageService.upload({
            Key: uploadKey,
            Body: buffer,
            ContentType: mimeType,
          });

          await prisma.media.create({
            data: {
              id: `${uuid}-${index}`,
              path: `${ENV.get("STORAGE_S3_ENDPOINT")}/anki-media/${uploadKey}`,
              type: mimeType,
              originalName: fileName,
              collectionId: collectionId,
            },
          });
        } catch (error) {
          console.error("Upload failed", error);
        }
      })
    );
  }

  private async createNotes(
    notes: any[],
    collectionId: string
  ): Promise<ImportRouteResponse> {
    return await Promise.all(
      notes.map(async (note) => {
        const createdNote = await prisma.note.create({
          data: {
            id: `${note.id}`,
            fields: JSON.stringify(note.fields),
            collectionId: collectionId,
          },
        });

        return {
          createdNote,
        };
      })
    );
  }

  private async cleanup() {
    rmSync(this.tempDir, { recursive: true, force: true });
    rmSync(this.filePath, { force: true });
  }

  public async import(): Promise<ImportRouteResponse> {
    try {
      await this.saveFile();

      const { notes, mediaMap } = await parseApkg(this.filePath, this.tempDir);

      const collection = await this.createCollection(this.collectionName);

      await this.uploadMedia(mediaMap, collection.id);

      const createdNotes = await this.createNotes(notes, collection.id);

      return createdNotes;
    } catch (error) {
      console.error("Import failed", error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}
