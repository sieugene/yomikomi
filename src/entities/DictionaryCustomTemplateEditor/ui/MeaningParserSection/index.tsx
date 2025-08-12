import React from "react";
import { DictionaryParserConfig, MeaningParserT } from "@features/dictionary/types";
import { CUSTOM_FN_EXAMPLE } from "../../lib/constants";

interface Props {
  config: DictionaryParserConfig;
  onChange: <K extends keyof DictionaryParserConfig>(
    field: K,
    value: DictionaryParserConfig[K]
  ) => void;
}

export const MeaningParserSection: React.FC<Props> = ({ config, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900">Meaning Parser</h4>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Parser Type
      </label>
      <select
        value={config.meaningParser.type}
        onChange={(e) =>
          onChange("meaningParser", {
            ...config.meaningParser,
            type: e.target.value as MeaningParserT,
          })
        }
        className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
      >
        <option value="array">Array</option>
        <option value="string">String</option>
        <option value="json">JSON</option>
        <option value="custom">Custom Function</option>
      </select>
    </div>
    {config.meaningParser.type === "custom" && (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Custom Function
          <span className="text-gray-500 font-normal ml-1">(JavaScript)</span>
        </label>
        <textarea
          value={config.meaningParser.customFunction || ""}
          onChange={(e) =>
            onChange("meaningParser", {
              ...config.meaningParser,
              customFunction: e.target.value,
            })
          }
          rows={8}
          className="mt-1 block w-full border rounded-md px-3 py-2 text-sm font-mono"
          placeholder={CUSTOM_FN_EXAMPLE}
        />
        <p className="text-xs text-gray-500 mt-1">
          Function should accept rawContent parameter and return string array
        </p>
      </div>
    )}
  </div>
);
