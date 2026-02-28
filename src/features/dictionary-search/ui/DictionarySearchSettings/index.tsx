import { Database } from "lucide-react";
import { useStoreDictionarySearch } from "../../context/DictionarySearchContext";
import { SearchModeToggle } from "../SearchModeToggle";
import { useDictionaries } from "@/features/dictionary/hooks";

export const DictionaryLookupSettings = () => {
  const { deepSearchMode, toggleDeepSearch } = useStoreDictionarySearch();
  const { activeDictionaries } = useDictionaries();
  return (
    <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center text-sm text-blue-700">
        <Database className="w-4 h-4 mr-1" />
        {activeDictionaries} active dictionaries
      </div>

      <div className="ml-auto">
        <SearchModeToggle
          deepMode={deepSearchMode}
          onToggle={toggleDeepSearch}
        />
      </div>
    </div>
  );
};
