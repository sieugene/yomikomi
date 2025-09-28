import { Modal } from "@/shared/ui/Modal";
import { Download, Loader } from "lucide-react";
import { FC, useState, useEffect } from "react";
import { GitHubApiClient } from "@/shared/api/github.api";

interface RecommendedDictionariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDictionarySelect: (file: File) => void;
}

interface DictionaryOption {
  language: string;
  url: string;
  displayName: string;
}

export const RecommendedDictionariesModal: FC<
  RecommendedDictionariesModalProps
> = ({ isOpen, onClose, onDictionarySelect }) => {
  const [dictionaries, setDictionaries] = useState<DictionaryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDictionaries();
    }
  }, [isOpen]);

  const loadDictionaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const dictList = await GitHubApiClient.getDictionaryList();

      const options: DictionaryOption[] = Object.entries(dictList).map(
        ([lang, url]) => ({
          language: lang,
          url,
          displayName: lang,
        })
      );

      setDictionaries(options);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dictionaries"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (dictionary: DictionaryOption) => {
    setDownloading(dictionary.language);
    setDownloadProgress(0);
    setError(null);

    try {
      const file = await GitHubApiClient.downloadDictionary(
        dictionary.url,
        (progress) => setDownloadProgress(progress)
      );

      onDictionarySelect(file);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download dictionary"
      );
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recommended Dictionaries"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading dictionaries...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={loadDictionaries}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && dictionaries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No dictionaries available
          </div>
        )}

        {dictionaries.map((dictionary) => (
          <div
            key={dictionary.language}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {dictionary.displayName} Dictionary
                </h4>
                <p className="text-sm text-gray-500">
                  JMdict {dictionary.displayName} definitions
                </p>
              </div>

              <button
                onClick={() => handleDownload(dictionary)}
                disabled={downloading !== null}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading === dictionary.language ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    {downloadProgress > 0
                      ? `${Math.round(downloadProgress)}%`
                      : "Downloading..."}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </button>
            </div>

            {downloading === dictionary.language && downloadProgress > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};
