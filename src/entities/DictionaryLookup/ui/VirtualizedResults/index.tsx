import React, { useState } from "react";
import { SearchResult } from "@/features/dictionary-search/types";
import { SearchResultCard } from "../SearchResultCard";

interface VirtualizedResultsProps {
  groups: Array<{
    word: string;
    results: SearchResult[];
  }>;
  deepSearchMode: boolean;
}

export const VirtualizedResults: React.FC<VirtualizedResultsProps> = ({
  groups,
  deepSearchMode,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 400;
  const itemHeight = 200;
  const overscan = 2;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    groups.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleGroups = groups.slice(startIndex, endIndex);
  const totalHeight = groups.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className="overflow-y-auto"
      style={{ height: `${containerHeight}px` }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleGroups.map((group, index) => (
            <div
              key={startIndex + index}
              className="border-l-4 border-blue-500 pl-4 mb-4"
            >
              <h4 className="font-semibold text-lg mb-3 text-gray-900">
                {group.word}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({group.results.length} result
                  {group.results.length !== 1 ? "s" : ""})
                </span>
              </h4>

              <div className="space-y-3">
                {group.results.map((result, resultIndex) => (
                  <SearchResultCard
                    key={`${result.source}-${resultIndex}`}
                    result={result}
                    maxMeanings={deepSearchMode ? 8 : 5}
                    showSource={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};