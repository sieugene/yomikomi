import React, { useState } from "react";
import {
  Plus,
  Database,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useDictionaryManager } from "@features/dictionary/hooks/useDictionaryManager";
import { DictionaryMetadata } from "@features/dictionary/types";
import { formatFileSize } from "@features/dictionary/lib/formatters";
import { StatusBadge } from "@/features/dictionary/ui/StatusBadge";
import { AddDictionaryModal } from "@features/dictionary/ui/AddDictionaryModal";
import { DictionaryDetailsModal } from "@features/dictionary/ui/DictionaryDetailsModal";

// Мелкие компоненты для статистики
const StatsCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
}> = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white p-4 rounded-lg shadow border">
    <div className="flex items-center">
      <Icon className={`w-8 h-8 ${color} mr-3`} />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

const DictionaryCard: React.FC<{
  dictionary: DictionaryMetadata;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: DictionaryMetadata["status"]) => void;
  onViewDetails: (dictionary: DictionaryMetadata) => void;
}> = ({ dictionary, onDelete, onStatusChange, onViewDetails }) => (
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
        <button
          onClick={() => {
            if (
              window.confirm("Are you sure you want to delete this dictionary?")
            ) {
              onDelete(dictionary.id);
            }
          }}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export const DictionaryManagementSystem: React.FC = () => {
  const {
    dictionaries,
    templates,
    loading,
    totalSize,
    addDictionary,
    deleteDictionary,
    updateDictionaryStatus,
    testParser,
  } = useDictionaryManager();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDictionary, setSelectedDictionary] =
    useState<DictionaryMetadata | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (dictionary: DictionaryMetadata) => {
    setSelectedDictionary(dictionary);
    setShowDetailsModal(true);
  };

  const stats = {
    total: dictionaries.length,
    active: dictionaries.filter((d) => d.status === "active").length,
    inactive: dictionaries.filter((d) => d.status === "inactive").length,
    error: dictionaries.filter((d) => d.status === "error").length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dictionary Management
          </h1>
          <p className="text-gray-600">
            {stats.total} dictionaries • {formatFileSize(totalSize)} total
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dictionary
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Database}
          value={stats.total}
          label="Total Dictionaries"
          color="text-blue-600"
        />
        <StatsCard
          icon={CheckCircle}
          value={stats.active}
          label="Active"
          color="text-green-600"
        />
        <StatsCard
          icon={AlertTriangle}
          value={stats.inactive}
          label="Inactive"
          color="text-yellow-600"
        />
        <StatsCard
          icon={Download}
          value={formatFileSize(totalSize)}
          label="Storage Used"
          color="text-purple-600"
        />
      </div>

      {/* Dictionaries Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dictionaries...</p>
        </div>
      ) : dictionaries.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No dictionaries yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first dictionary.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Dictionary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dictionaries.map((dictionary) => (
            <DictionaryCard
              key={dictionary.id}
              dictionary={dictionary}
              onDelete={deleteDictionary}
              onStatusChange={updateDictionaryStatus}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddDictionaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        templates={templates}
        onAdd={addDictionary}
        onTest={testParser}
      />

      <DictionaryDetailsModal
        dictionary={selectedDictionary}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};
