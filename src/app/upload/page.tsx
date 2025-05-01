"use client";
import { NotesViewer } from "@/entities/NotesViewer/ui";
import { ParseApkgData } from "@/shared/lib/apkgParser";
import { DumpData } from "@/shared/data/dump.data";
import { useState } from "react";
import { API_ENDPOINTS } from "@/shared/api";

export default function UploadPage() {
  const [data, setData] = useState<ParseApkgData>({
    mediaMap: {},
    notes: DumpData,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(API_ENDPOINTS.import, {
      method: "POST",
      body: form,
    });
    const json = (await res.json()) as ParseApkgData;
    setData(json);
  };

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        className="ml-2 px-4 py-1 bg-blue-600 text-white"
        onClick={handleUpload}
      >
        Upload
      </button>
      <NotesViewer notes={data.notes} />
    </div>
  );
}
