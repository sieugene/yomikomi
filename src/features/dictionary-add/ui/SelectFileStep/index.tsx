import { Database, Upload } from "lucide-react";
import { FC } from "react";

type Props = {
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export const SelectFileStep: FC<Props> = ({ handleFileSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Dictionary File</h3>
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
    </div>
  );
};
