import { formatFileSize } from "@/features/dictionary/lib/formatters";
import { DictionaryTemplate } from "@/features/dictionary/types";
import { FC } from "react";

type Props = {
  selectedFile: File | null;
  selectedTemplate: DictionaryTemplate | undefined;
  onBackClick: () => void;
  handleAdd: () => Promise<void>;
  loading: boolean;
};
export const FinalStep: FC<Props> = ({
  selectedFile,
  selectedTemplate,
  onBackClick,
  handleAdd,
  loading,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Ready to Add Dictionary</h3>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div>
          <strong>File:</strong> {selectedFile?.name}
        </div>
        <div>
          <strong>Size:</strong>{" "}
          {selectedFile ? formatFileSize(selectedFile.size) : "Unknown"}
        </div>
        <div>
          <strong>Template:</strong> {selectedTemplate?.name || "Custom"}
        </div>
        {selectedTemplate && (
          <div>
            <strong>Language:</strong> {selectedTemplate.language.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onBackClick}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleAdd}
          disabled={loading || !selectedFile}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Dictionary"}
        </button>
      </div>
    </div>
  );
};
