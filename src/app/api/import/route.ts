import { parseApkg } from "@/lib/apkgParser";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path, { join } from "path";

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

  rmSync(tempDir, { recursive: true, force: true });

  return NextResponse.json({ notes, mediaMap });
}
