"use client";
import { NotesViewer } from "@/entities/NotesViewer/ui";
import { SqlJsProvider } from "@/features/AnkiParser/context/SqlJsProvider";
import { useAnkiParser } from "@/features/AnkiParser/hooks/useAnkiParser";

const Page = () => {
  const { handleUpload, setFile, data } = useAnkiParser();

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
      <h2>Local imported card:</h2>
      <NotesViewer data={data} />{" "}
    </div>
  );
};

const UploadPage = () => {
  return (
    <SqlJsProvider>
      <Page />
    </SqlJsProvider>
  );
};
export default UploadPage;
