"use client";
import { NotesViewer } from "@/entities/NotesViewer/ui";
import { useNotes, useUpload } from "@/features/Upload/hooks/useUpload";

export default function UploadPage() {
  const { data } = useNotes();
  const { handleUpload, setFile } = useUpload();

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
      <NotesViewer data={data} />
    </div>
  );
}
