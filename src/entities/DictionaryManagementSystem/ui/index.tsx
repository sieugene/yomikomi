import { useDictionariesStats } from "@/entities/DictionaryManagementSystem/hooks/useDictionariesStats";
import { DictionaryDetailsModal } from "@/entities/DictionaryManagementSystem/ui/DictionaryDetailsModal";
import { StatsCard } from "@/entities/DictionaryManagementSystem/ui/StatsCard";
import { AddDictionary } from "@/features/dictionary-add/ui";
import { useDictionaryManager } from "@features/dictionary/hooks/useDictionaryManager";
import { formatFileSize } from "@features/dictionary/lib/formatters";
import { DictionaryMetadata } from "@features/dictionary/types";
import { Database } from "lucide-react";
import React, { useState } from "react";
import { DictionaryCard } from "./DictionaryCard";

export const DictionaryManagementSystem: React.FC = () => {
  const {
    dictionaries,
    loading,
    totalSize,
    updateDictionaryStatus,
  } = useDictionaryManager();

  const [selectedDictionary, setSelectedDictionary] =
    useState<DictionaryMetadata | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (dictionary: DictionaryMetadata) => {
    setSelectedDictionary(dictionary);
    setShowDetailsModal(true);
  };

  const { stats, statsCards } = useDictionariesStats(dictionaries, totalSize);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dictionary Management
          </h1>
          <p className="text-gray-600">
            {stats.total} dictionaries • {formatFileSize(totalSize)} total
          </p>
        </div>
        <AddDictionary />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

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
          <AddDictionary />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dictionaries.map((dictionary) => (
            <DictionaryCard
              key={dictionary.id}
              dictionary={dictionary}
              onStatusChange={updateDictionaryStatus}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <DictionaryDetailsModal
        dictionary={selectedDictionary}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};
