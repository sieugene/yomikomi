import React from "react";
import { DictionaryParserConfig } from "@features/dictionary/types";

interface Props {
  config: DictionaryParserConfig;
  onChange: <K extends keyof DictionaryParserConfig>(field: K, value: DictionaryParserConfig[K]) => void;
}

export const ColumnMappingSection: React.FC<Props> = ({ config, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900">Column Mapping</h4>
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(config.columnMapping).map(([field, value]) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 capitalize">{field} Column</label>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              onChange("columnMapping", {
                ...config.columnMapping,
                [field]: parseInt(e.target.value) || 0,
              })
            }
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
            min="0"
          />
        </div>
      ))}
    </div>
  </div>
);
