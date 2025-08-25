import { FileImage, Upload } from "lucide-react";
import { ChangeEvent, DragEvent, FC } from "react";

type Props = {
  handleDragOver: (e: DragEvent<Element>) => void;
  handleDrop: (e: DragEvent<Element>) => void;
  handleFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
};
export const FileUploader: FC<Props> = ({
  handleDragOver,
  handleDrop,
  handleFileInput,
}) => {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FileImage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <div className="space-y-2">
        <div className="text-lg font-medium text-gray-900">
          Drop an image here or click to select
        </div>
        <div className="text-sm text-gray-500">
          Supports: JPG, PNG, GIF, WebP
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="inline-flex items-center px-4 py-2 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
      >
        <Upload className="w-4 h-4 mr-2" />
        Choose Image
      </label>
    </div>
  );
};
