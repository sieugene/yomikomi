import { StorageService } from "@/infrastructure/storage/storage";
import { parseApkg } from "@/shared/lib/apkgParser";
import { ENV } from "@/shared/env";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { lookup } from "mime-types";
import { NextRequest, NextResponse } from "next/server";
import path, { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const filePath = join("/tmp", Date.now().toString(), file.name);
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

  const tempDir = join("/tmp", Date.now().toString());
  mkdirSync(tempDir, { recursive: true });

  const { notes, mediaMap } = await parseApkg(filePath, tempDir);

  const uuid = uuidv4();
  // Upload Media
  const uploadedMedia: Record<string, string> = {};
  for (const [index, fileName] of Object.entries(mediaMap)) {
    const mediaFilePath = path.join(tempDir, index);
    if (!existsSync(mediaFilePath)) continue;

    const fileBuffer = readFileSync(mediaFilePath);
    const uploadKey = `${uuid}-${fileName}`;
    const mimeType = lookup(fileName) || "application/octet-stream";

    try {
      await StorageService.upload({
        Key: uploadKey,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      uploadedMedia[index] = `${ENV.get(
        "STORAGE_S3_ENDPOINT"
      )}/anki-media/${uploadKey}`;
    } catch (error) {
      console.error("error while uploading media", error);
    }
  }
  // Clear temp
  rmSync(tempDir, { recursive: true, force: true });

  return NextResponse.json({ notes, uploadedMedia });
}
