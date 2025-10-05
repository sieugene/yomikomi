import { useMemo, useState } from "react";
import { SearchResult } from "@/features/dictionary-search/types";

interface UseSourceFilteringProps {
  results: Array<{
    word: string;
    results: SearchResult[];
  }>;
}

export const useSourceFiltering = ({ results }: UseSourceFilteringProps) => {
  const [activeSource, setActiveSource] = useState("all");

  const { sources, resultCounts, filteredResults } = useMemo(() => {
    const sourcesSet = new Set<string>();
    const counts: Record<string, number> = { all: 0 };

    results.forEach((group) => {
      group.results.forEach((result) => {
        sourcesSet.add(result.source);
        counts[result.source] = (counts[result.source] || 0) + 1;
        counts.all++;
      });
    });

    const sourcesList = ["all", ...Array.from(sourcesSet).sort()];

    const filtered =
      activeSource === "all"
        ? results
        : results
            .map((group) => ({
              ...group,
              results: group.results.filter((r) => r.source === activeSource),
            }))
            .filter((group) => group.results.length > 0);

    return {
      sources: sourcesList,
      resultCounts: counts,
      filteredResults: filtered,
    };
  }, [results, activeSource]);

  return {
    sources,
    resultCounts,
    filteredResults,
    activeSource,
    setActiveSource,
  };
};