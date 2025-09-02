import { useHealth } from "@/entities/Health/hooks/useHealth";
import { Health } from "@/entities/Health/ui";
import { NotesViewer } from "@/entities/NotesViewer/ui";
import { useCloudParse } from "@/features/AnkiParser/hooks/useCloudParse";
import { useOfflineParse } from "@/features/AnkiParser/hooks/useOfflineParse";
import { FAST_MEMORY_CLOUD_FILE_NAME } from "@/features/AnkiParser/lib/constants";
import { useStoreCollection } from "@/features/AnkiParser/context/StoreCollectionContext";
import { Collections } from "@/features/AnkiParser/ui/collection/Collections";
import { Import } from "@/features/AnkiParser/ui/import";
import { useMemo, useState } from "react";

type SubmitType = "local" | "link";

export const Parser = () => {
  const { state } = useStoreCollection();
  const { health } = useHealth();

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    upload: offlineUpload,
    data: offlineData,
    getCacheFile,
  } = useOfflineParse();
  const {
    upload: cloudUpload,
    data: cloudData,
    getCacheFile: getCloudCacheFile,
  } = useCloudParse();
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

      if (type === "link" && url.trim()) {
        await cloudUpload(url);

        setUrl("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCacheFile = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      // TODO: refactor this
      if (name === FAST_MEMORY_CLOUD_FILE_NAME) {
        await getCloudCacheFile(id);
        return;
      } else {
        await getCacheFile(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const urlNotEmpty = !!url.trim();
  const isLocalDisabled = !file || urlNotEmpty;
  const isUrlInputDisabled = !!file;

  return (
    <>
      <Health health={health} />

      <Import setFile={setFile} disabled={urlNotEmpty} selectedFile={file} />

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
                    handleGetCacheFile(id, name);
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
          Collection Imports:
        </h2>
        <Collections />
      </div>

      {viewerData?.length ? <NotesViewer data={viewerData} /> : ""}
    </>
  );
};
