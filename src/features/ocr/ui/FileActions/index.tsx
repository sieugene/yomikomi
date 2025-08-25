import { FileImage } from "lucide-react";
import { FC } from "react";

type Props = {
  selectedFile: File | null;
  handleReset: () => void;
  handlePerformOCR: () => Promise<void>;
  isLoading: boolean;
};
export const FileActions: FC<Props> = ({
  handlePerformOCR,
  handleReset,
  selectedFile,
  isLoading,
}) => {
  if (!selectedFile) return;
  return (
    <>
      <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <FileImage className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700">
            {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePerformOCR}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? "Processing..." : "Extract Text"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
};
