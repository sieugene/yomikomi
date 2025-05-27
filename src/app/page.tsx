"use client";
import { useHealth } from "@/entities/Health/hooks/useHealth";
import { Health } from "@/entities/Health/ui";
import { NotesViewer } from "@/entities/NotesViewer/ui";
import { SqlJsProvider } from "@/features/AnkiParser/context/SqlJsProvider";
import { useCloudParse } from "@/features/AnkiParser/hooks/useCloudParse";
import { useOfflineParse } from "@/features/AnkiParser/hooks/useOfflineParse";
import {
  StoreCollectionProvider,
  useStoreCollection,
} from "@/features/Collection/context/StoreCollectionContext";
import { Collections } from "@/features/Collection/ui/Collections";
import { FileImport } from "@/features/FileImport/ui";
import { useUpload } from "@/features/Upload/hooks/useUpload";
import { useMemo, useState } from "react";

type SubmitType = "local" | "backend" | "link";

const Home = () => {
  const { state } = useStoreCollection();
  const { health, servicesIsActive } = useHealth();

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    upload: offlineUpload,
    data: offlineData,
    getCacheFile,
  } = useOfflineParse();
  const { handleUpload: backendUpload } = useUpload();
  const { upload: cloudUpload, data: cloudData } = useCloudParse();
  const viewerData = useMemo(() => {
    if (offlineData.length) return offlineData;
    if (cloudData.length) return cloudData;
    return [];
  }, [offlineData, cloudData]);

  const onSubmit = async (type: SubmitType) => {
    setIsLoading(true);
    try {
      if (type === "local" && file) {
        await offlineUpload(file);

        setFile(null);
      }

      if (type === "backend" && file) {
        await backendUpload(file);

        setFile(null);
      }

      if (type === "link" && url.trim()) {
        await cloudUpload(url);

        setUrl("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCacheFile = async (id: string) => {
    setIsLoading(true);
    try {
      await getCacheFile(id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const urlNotEmpty = !!url.trim();
  const isLocalDisabled = !file || urlNotEmpty;
  const isBackendDisabled = !servicesIsActive || !file;
  const isUrlInputDisabled = !!file;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <Health health={health} />

      <h1 className="mt-12 text-4xl font-extrabold text-indigo-900 mb-8">
        Import Anki Deck
      </h1>

      <FileImport
        setFile={setFile}
        disabled={urlNotEmpty}
        selectedFile={file}
      />

      <label
        htmlFor="cloudLink"
        className="mb-2 mt-6 text-indigo-800 font-semibold"
      >
        Or Import by mega cloud link
      </label>

      <div className="w-full max-w-xl flex flex-col items-center">
        <input
          id="cloudLink"
          type="url"
          value={url}
          disabled={isUrlInputDisabled}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://mega.nz/..."
          className={`w-full p-3 rounded border ${
            isUrlInputDisabled ? "bg-gray-100 cursor-not-allowed" : ""
          } border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      <div className="flex flex-col items-center mt-6 space-y-3">
        <button
          type="button"
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onSubmit("local")}
          disabled={isLocalDisabled || isLoading}
        >
          Import (local)
        </button>

        <button
          type="button"
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onSubmit("backend")}
          disabled={isBackendDisabled || isLoading}
        >
          Import (backend)
        </button>

        <button
          type="button"
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onSubmit("link")}
          disabled={!url.trim() || isLoading}
        >
          Import by mega cloud link
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 text-indigo-800 font-medium text-lg">
          ⏳ Loading...
        </div>
      )}

      <div className="mt-12 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4">
          Local Imports:
        </h2>
        <ul className="space-y-3">
          {state.data.length
            ? state.data.map(({ id, name }) => (
                <li
                  onClick={() => {
                    handleGetCacheFile(id);
                  }}
                  key={id}
                  className="flex items-center bg-white rounded-lg shadow p-4 border border-indigo-200 cursor-pointer"
                >
                  <span className="text-2xl mr-4">📁</span>
                  <p className="break-all text-indigo-800">{name}</p>
                </li>
              ))
            : "-"}
        </ul>
      </div>

      <div className="mt-12 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4">
          Backend Imports:
        </h2>
        <Collections />
      </div>

      {viewerData?.length ? <NotesViewer data={viewerData} /> : ""}
    </div>
  );
};

const HomePage = () => {
  return (
    <SqlJsProvider>
      <StoreCollectionProvider>
        <Home />
      </StoreCollectionProvider>
    </SqlJsProvider>
  );
};

export default HomePage;
