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
        String(field).toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-4">
              <Zap className="w-4 h-4" />
              <span>Powerful Anki Parser</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              Import Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Flashcards
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Parse and manage Anki decks with ease. Upload files or import from
              cloud storage.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Import Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Upload */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Local File</h3>
                <p className="text-sm text-slate-400">
                  Upload .apkg from device
                </p>
              </div>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("fileInput")?.click()}
              className="relative border-2 border-dashed border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all group"
            >
              <input
                id="fileInput"
                type="file"
                accept=".apkg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                  <Database className="w-8 h-8 text-slate-400 group-hover:text-blue-400 transition-all" />
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-blue-400">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Drop file here</p>
                    <p className="text-sm text-slate-500">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onSubmitLocal}
              disabled={!file || isLoading}
              className="w-full mt-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Import Local File
            </button>
          </div>

          {/* Cloud Import */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ExternalLink className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cloud Link</h3>
                <p className="text-sm text-slate-400">Import from MEGA</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://mega.nz/..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />

              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Download className="w-3 h-3" />
                  Paste your MEGA cloud link above
                </p>
              </div>
            </div>

            <button
              onClick={onSubmitCloud}
              disabled={!url.trim() || isLoading}
              className="w-full mt-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Import from Cloud
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">Processing your deck...</p>
                <p className="text-sm text-slate-400">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Collections */}
        {state.data.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Saved Collections</h2>
              </div>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                {state.data.length} {state.data.length === 1 ? "deck" : "decks"}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {state.data.map(({ id, name }) => (
                <div
                  key={id}
                  onClick={() => handleGetCacheFile(id, name)}
                  className="group bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-purple-500 hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Book className="w-5 h-5 text-purple-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <h3 className="font-semibold truncate group-hover:text-purple-400 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Click to load</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deck Viewer */}
        {viewerData.length > 0 && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Deck Preview</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {viewerData.length} flashcards loaded
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cards..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-purple-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "list"
                          ? "bg-purple-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <List className="w-5 h-5" />
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400">
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
