import { formatFileSize } from "@/features/dictionary/lib/formatters";
import { DictionaryMetadata } from "@/features/dictionary/types";
import { StatusBadge } from "@/entities/DictionaryManagementSystem/ui/StatusBadge";
import { DictionaryDelete } from "@/features/dictionary-delete/ui";

type Props = {
  dictionary: DictionaryMetadata;
  onStatusChange: (id: string, status: DictionaryMetadata["status"]) => void;
  onViewDetails: (dictionary: DictionaryMetadata) => void;
};
export const DictionaryCard: React.FC<Props> = ({
  dictionary,
  onStatusChange,
  onViewDetails,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {dictionary.name}
        </h3>
        <p className="text-sm text-gray-500">
          Language: {dictionary.language.toUpperCase()} • Size:{" "}
          {formatFileSize(dictionary.size)}
        </p>
      </div>
      <StatusBadge status={dictionary.status} />
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-xs text-gray-500">Created</p>
        <p className="text-sm font-medium">
          {dictionary.createdAt.toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Template</p>
        <p className="text-sm font-medium">{dictionary.parserTemplate}</p>
      </div>
    </div>

    {dictionary.lastTestResult && (
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-500 mb-1">Last Test Result</p>
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              dictionary.lastTestResult.success
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {dictionary.lastTestResult.success ? "✓ Passed" : "✗ Failed"}
          </span>
          <span className="text-xs text-gray-500">
            Query: {dictionary.lastTestResult.performance.queryTime.toFixed(1)}
            ms
          </span>
        </div>
      </div>
    )}

    <div className="flex items-center justify-between">
      <select
        value={dictionary.status}
        onChange={(e) =>
          onStatusChange(
            dictionary.id,
            e.target.value as DictionaryMetadata["status"]
          )
        }
        className="text-xs border border-gray-300 rounded px-2 py-1"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <div className="flex space-x-2">
        <button
          onClick={() => onViewDetails(dictionary)}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Details
        </button>
        <DictionaryDelete id={dictionary.id} />
      </div>
    </div>
  </div>
);
