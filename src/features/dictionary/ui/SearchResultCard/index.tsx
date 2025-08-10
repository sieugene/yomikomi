import React from "react";
import { Database, Clock, TrendingUp } from "lucide-react";
import { SearchResult } from "@features/dictionary/types";

interface SearchResultCardProps {
  result: SearchResult;
  showSource?: boolean;
  maxMeanings?: number;
  className?: string;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  showSource = true,
  maxMeanings = 5,
  className = "",
}) => {
  const displayedMeanings = result.meanings.slice(0, maxMeanings);
  const hasMoreMeanings = result.meanings.length > maxMeanings;

  const getMatchTypeColor = (matchType: SearchResult["matchType"]) => {
    switch (matchType) {
      case "exact":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      case "substring":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`bg-gray-50 rounded-md p-3 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <span className="font-medium text-lg">{result.word}</span>
          {result.reading && result.reading !== result.word && (
            <span className="ml-2 text-gray-600">({result.reading})</span>
          )}
          <div className="flex items-center mt-1 space-x-2">
            {result.type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {result.type}
              </span>
            )}
            <span
              className={`px-2 py-1 text-xs rounded ${getMatchTypeColor(
                result.matchType
              )}`}
            >
              {result.matchType}
            </span>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500 ml-2">
          <TrendingUp className="w-3 h-3 mr-1" />
          {result.relevanceScore.toFixed(0)}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex flex-wrap gap-1">
          {displayedMeanings.map((meaning, meaningIndex) => (
            <span
              key={meaningIndex}
              className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
            >
              {meaning}
            </span>
          ))}
          {hasMoreMeanings && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{result.meanings.length - maxMeanings} more
            </span>
          )}
        </div>
      </div>

      {showSource && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Database className="w-3 h-3 mr-1" />
            {result.source}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {result.meanings.length} meaning
            {result.meanings.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};
