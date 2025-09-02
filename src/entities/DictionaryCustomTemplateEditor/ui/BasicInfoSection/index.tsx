import React from "react";
import { DictionaryParserConfig } from "@features/dictionary/types";

interface Props {
  config: DictionaryParserConfig;
  onChange: <K extends keyof DictionaryParserConfig>(field: K, value: DictionaryParserConfig[K]) => void;
}

export const BasicInfoSection: React.FC<Props> = ({ config, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900">Basic Information</h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Parser name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Version</label>
        <input
          type="text"
          value={config.version}
          onChange={(e) => onChange("version", e.target.value)}
          className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
          placeholder="1.0.0"
        />
      </div>
    </div>
  </div>
);
