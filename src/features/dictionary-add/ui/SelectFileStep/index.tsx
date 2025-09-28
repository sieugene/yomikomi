import { Database, Upload, Download, BookOpen } from "lucide-react";
import { FC, useState } from "react";
import { RecommendedDictionariesModal } from "../RecommendedDictionariesModal";

type Props = {
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRecommendedFileSelect?: (file: File) => void;
};

export const SelectFileStep: FC<Props> = ({
  handleFileSelect,
  onRecommendedFileSelect,
}) => {
  const [showRecommendedModal, setShowRecommendedModal] = useState(false);

  const handleRecommendedDictionary = (file: File) => {
    if (onRecommendedFileSelect) {
      onRecommendedFileSelect(file);
    }
    setShowRecommendedModal(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Select Dictionary File</h3>

      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Choose SQLite dictionary file</p>
        <input
          type="file"
          accept=".sqlite,.db"
          onChange={handleFileSelect}
          className="hidden"
          id="dictionary-file"
        />
        <label
          htmlFor="dictionary-file"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          Select File
        </label>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setShowRecommendedModal(true)}
          className="flex items-center justify-center px-4 py-3 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Get Recommended Dictionaries
        </button>

        <a
          href="https://github.com/sieugene/yomikomi-dictionaries/blob/main/README.md"
          className="flex items-center justify-center px-4 py-3 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
          target="_blank"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          How to Create Your Dictionary
        </a>
      </div>

      {/* Recommended Dictionaries Modal */}
      <RecommendedDictionariesModal
        isOpen={showRecommendedModal}
        onClose={() => setShowRecommendedModal(false)}
        onDictionarySelect={handleRecommendedDictionary}
      />
    </div>
  );
};
