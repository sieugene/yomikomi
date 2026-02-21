import { NotesViewer } from "@/entities/NotesViewer/ui";
import { useStoreCollection } from "@/features/AnkiParser/context/StoreCollectionContext";
import { useCloudParse } from "@/features/AnkiParser/hooks/useCloudParse";
import { useOfflineParse } from "@/features/AnkiParser/hooks/useOfflineParse";
import { FAST_MEMORY_CLOUD_FILE_NAME } from "@/features/AnkiParser/lib/constants";
import {
  Book,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  Folder,
  Grid,
  List,
  Search,
  Upload,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Parser = () => {
  const { state } = useStoreCollection();

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const filteredNotes = useMemo(() => {
    if (!searchQuery || !viewerData.length) return viewerData;

    return viewerData.filter((item) => {
      const fields = item.note.fields;
      return Object.values(fields).some((field) =>
        String(field).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    });
  }, [viewerData, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".apkg")) {
      setFile(droppedFile);
    }
  };

  const onSubmitLocal = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      await offlineUpload(file);
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCloud = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    try {
      await cloudUpload(url);
      setUrl("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCacheFile = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      if (name === FAST_MEMORY_CLOUD_FILE_NAME) {
        await getCloudCacheFile(id);
      } else {
        await getCacheFile(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-1">
            <Zap className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Import Flashcards
            </h1>
          </div>
          <p className="text-gray-500 ml-9">
            Parse and manage Anki decks. Upload files or import from cloud
            storage.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Import Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Upload */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Local File
                </h3>
                <p className="text-sm text-gray-500">
                  Upload .apkg from device
                </p>
              </div>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("fileInput")?.click()}
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <input
                id="fileInput"
                type="file"
                accept=".apkg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                  <Database className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-all" />
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-blue-600">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-700">Drop file here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onSubmitLocal}
              disabled={!file || isLoading}
              className="w-full mt-5 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Import Local File
            </button>
          </div>

          {/* Cloud Import */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cloud Link
                </h3>
                <p className="text-sm text-gray-500">Import from MEGA</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://mega.nz/..."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder-gray-400 transition-all"
              />

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Download className="w-3 h-3" />
                  Paste your MEGA cloud link above
                </p>
              </div>
            </div>

            <button
              onClick={onSubmitCloud}
              disabled={!url.trim() || isLoading}
              className="w-full mt-5 py-2.5 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Import from Cloud
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-lg">
                  Processing your deck...
                </p>
                <p className="text-sm text-gray-500">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Collections */}
        {state.data.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Saved Collections
                </h2>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {state.data.length} {state.data.length === 1 ? "deck" : "decks"}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {state.data.map(({ id, name }) => (
                <div
                  key={id}
                  onClick={() => handleGetCacheFile(id, name)}
                  className="group bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Book className="w-4 h-4 text-blue-600" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Click to load</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deck Viewer */}
        {viewerData.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Deck Preview
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {viewerData.length} flashcards loaded
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cards..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder-gray-400 transition-all"
                    />
                  </div>

                  <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              <NotesViewer data={filteredNotes} />
            </div>

            {filteredNotes.length === 0 && searchQuery && (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  No cards found matching {searchQuery}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
