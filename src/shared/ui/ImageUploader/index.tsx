import { FileImage, Upload } from "lucide-react";



type Props = {
    onFilesSelected: (files: FileList | null) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isCreating?: boolean;
    isMultiple?: boolean;
}
export const ImageUploader: React.FC<Props> = ({
    onDragOver,
    onDrop,
    onFileInput,
    isCreating,
    isMultiple
}) => {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <FileImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900">
          Drop {isMultiple ? "images" : "an image"} here or click to select
        </div>
        <div className="text-xs text-gray-500">
          Supports: JPG, PNG, GIF, WebP (Max 500 files)
        </div>
      </div>
      <input
        type="file"
        multiple={isMultiple}
        accept="image/*"
        onChange={onFileInput}
        disabled={isCreating}
        className="hidden"
        id="batch-file-input"
      />
      <label
        htmlFor="batch-file-input"
        className="inline-flex items-center px-3 py-2 mt-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
      >
        <Upload className="w-4 h-4 mr-1" />
        Choose {isMultiple ? "Files" : "File"}
      </label>
    </div>
  );
};
