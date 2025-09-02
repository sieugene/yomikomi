import React from "react";
import {
  DictionaryParserConfig,
  SearchStrategyT,
} from "@features/dictionary/types";

interface Props {
  config: DictionaryParserConfig;
  onChange: <K extends keyof DictionaryParserConfig>(
    field: K,
    value: DictionaryParserConfig[K]
  ) => void;
}

export const SearchStrategySection: React.FC<Props> = ({
  config,
  onChange,
}) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900">Search Strategy</h4>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Strategy Type
      </label>
      <select
        value={config.searchStrategy.type}
        onChange={(e) =>
          onChange("searchStrategy", {
            ...config.searchStrategy,
            type: e.target.value as SearchStrategyT,
          })
        }
        className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
      >
        <option value="exact">Exact Match</option>
        <option value="partial">Partial Match</option>
        <option value="ngram">N-gram Search</option>
      </select>
    </div>
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={config.searchStrategy.includeSubstrings || false}
        onChange={(e) =>
          onChange("searchStrategy", {
            ...config.searchStrategy,
            includeSubstrings: e.target.checked,
          })
        }
        className="rounded border-gray-300"
      />
      <span className="ml-2 text-sm text-gray-700">Include Substrings</span>
    </label>
  </div>
);
