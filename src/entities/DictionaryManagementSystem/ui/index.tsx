import { useDictionariesStats } from "@/entities/DictionaryManagementSystem/hooks/useDictionariesStats";
import { StatsCard } from "@/entities/DictionaryManagementSystem/ui/StatsCard";
import { AddDictionary } from "@/features/dictionary-add/ui";
import { DictionaryOverview } from "@/features/dictionary-overview/ui";
import {
  useDictionaries,
  useDictionariesSize,
} from "@/features/dictionary/hooks/useDictionaries";
import { useDictionaryManager } from "@features/dictionary/hooks/useDictionaryManager";
import { Database } from "lucide-react";
import React from "react";

export const DictionaryManagementSystem: React.FC = () => {
  const { loading: managerIsLoading } = useDictionaryManager();
  const { data: dictionaries, isLoading: dictionariesIsLoading } =
    useDictionaries();
  const loading = dictionariesIsLoading || managerIsLoading;
  const { formattedTotalSize } = useDictionariesSize();

  const { stats, statsCards } = useDictionariesStats(
    dictionaries,
    formattedTotalSize
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dictionary Management
          </h1>
          <p className="text-gray-600">
            {stats.total} dictionaries • {formattedTotalSize} total
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
            <DictionaryOverview key={dictionary.id} id={dictionary.id} />
          ))}
        </div>
      )}
    </div>
  );
};
