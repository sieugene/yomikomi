import React from "react";
import { DictionaryParserConfig } from "@features/dictionary/types";

interface Props {
  config: DictionaryParserConfig;
  onChange: <K extends keyof DictionaryParserConfig>(field: K, value: DictionaryParserConfig[K]) => void;
}

export const SqlQuerySection: React.FC<Props> = ({ config, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      SQL Query
      <span className="text-gray-500 font-normal ml-1">(Use ? as placeholders)</span>
    </label>
    <textarea
      value={config.sqlQuery}
      onChange={(e) => onChange("sqlQuery", e.target.value)}
      rows={6}
      className="block w-full border rounded-md px-3 py-2 text-sm font-mono"
      placeholder="SELECT * FROM terms WHERE..."
    />
    <p className="text-xs text-gray-500">
      Example: SELECT * FROM terms WHERE "0" = ? ORDER BY length("0") DESC LIMIT 20
    </p>
  </div>
);
