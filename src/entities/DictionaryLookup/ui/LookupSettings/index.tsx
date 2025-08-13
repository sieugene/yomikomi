import { Database } from "lucide-react";
import { SearchModeToggle } from "../SearchModeToggle";
import { FC } from "react";

type Props = {
  activeEngineCount: number;
  loading: boolean;
  deepSearchMode: boolean;
  toggleDeepSearch: () => void;
};
export const LookupSettings: FC<Props> = ({
  activeEngineCount,
  deepSearchMode,
  loading,
  toggleDeepSearch,
}) => {
  return (
    <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center text-sm text-blue-700">
        <Database className="w-4 h-4 mr-1" />
        {activeEngineCount} active dictionaries
      </div>

      {loading && (
        <div className="flex items-center text-sm text-blue-700">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-2"></div>
          Searching...
        </div>
      )}

      <div className="ml-auto">
        <SearchModeToggle
          deepMode={deepSearchMode}
          onToggle={toggleDeepSearch}
        />
      </div>
    </div>
  );
};
