"use client";
import { Collections } from "@/features/Collection/ui/Collections";
import { useUpload } from "@/features/Upload/hooks/useUpload";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handleUpload } = useUpload();

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        className="ml-2 px-4 py-1 bg-blue-600 text-white"
        onClick={() => handleUpload(file)}
      >
        Upload
      </button>
      <Collections />
    </div>
  );
}
