import { StorageService } from "@/infrastructure/storage/storage";
import { parseApkg } from "@/shared/lib/apkgParser";
import { ENV } from "@/shared/env";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { lookup } from "mime-types";
import { NextRequest, NextResponse } from "next/server";
import path, { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/infrastructure/database/prisma";
import { Note } from "@/infrastructure/database/generated";

export type ImportRouteResponse = {
  createdNote: Note;
}[];

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const now = Date.now().toString();
  const filePath = join("/tmp", now, file.name);
  const tempDir = join("/tmp", `${now}-dir`);

  const fileStream = file.stream();
  const reader = fileStream.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(value);
    done = doneReading;
  }

  const fileBuffer = Buffer.concat(chunks);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, fileBuffer);
  mkdirSync(tempDir, { recursive: true });

  const { notes, mediaMap } = await parseApkg(filePath, tempDir);

  await Promise.all(
    Object.entries(mediaMap).map(async ([index, fileName]) => {
      const mediaFilePath = path.join(tempDir, index);
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
          },
        });
      } catch (error) {
        console.error("Upload failed", error);
      }
    })
  );

  const createdNotes: ImportRouteResponse = await Promise.all(
    notes.map(async (note) => {
      const createdNote = await prisma.note.create({
        data: {
          id: `${note.id}`,
          fields: JSON.stringify(note.fields),
        },
      });

      return {
        createdNote,
      };
    })
  );

  rmSync(tempDir, { recursive: true, force: true });
  rmSync(filePath, { force: true });

  return NextResponse.json(createdNotes);
}
