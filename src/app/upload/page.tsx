"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/import", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    console.log(json);
    setStatus(`Imported: ${json.notes} cards`);
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
      <p className="mt-2">{status}</p>
    </div>
  );
}
