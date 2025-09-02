import { formatSearchStats } from "@/features/dictionary/lib/formatters";
import { FC } from "react";

type Props = {
  searchStats: {
    searchTime: number;
    resultCount: number;
    uniqueWords: number;
  } | null;
  deepSearchMode: boolean;
};
export const MainResultStats: FC<Props> = ({ deepSearchMode, searchStats }) => {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        {searchStats && formatSearchStats(
          searchStats.resultCount,
          searchStats.uniqueWords,
          searchStats.searchTime
        )}
        {deepSearchMode && (
          <span className="ml-3 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
            Deep Search Active
          </span>
        )}
      </div>
    </div>
  );
};
