import { CUSTOM_FN_EXAMPLE } from "@features/dictionary/lib/constants";
import { ConfigValidator } from "@features/dictionary/lib/validation";
import {
  DictionaryParserConfig,
  ParserTestResult,
} from "@features/dictionary/types";
import { AlertCircle, CheckCircle, Save, TestTube } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CustomTemplateEditorProps {
  initialConfig?: DictionaryParserConfig;
  onSave: (config: DictionaryParserConfig) => void;
  onTest?: (config: DictionaryParserConfig) => Promise<ParserTestResult>;
  file?: File;
}

const DEFAULT_CONFIG: DictionaryParserConfig = {
  name: "Custom Parser",
  version: "1.0.0",
  sqlQuery: `
SELECT DISTINCT * FROM terms 
WHERE "0" = ? 
ORDER BY length("0") DESC 
LIMIT 20
  `.trim(),
  columnMapping: {
    word: 0,
    reading: 1,
    type: 2,
    meanings: 5,
  },
  meaningParser: {
    type: "array",
  },
  searchStrategy: {
    type: "exact",
  },
};

export const CustomTemplateEditor: React.FC<CustomTemplateEditorProps> = ({
  initialConfig,
  onSave,
  onTest,
  file,
}) => {
  const [config, setConfig] = useState<DictionaryParserConfig>(
    initialConfig || DEFAULT_CONFIG
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<ParserTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const errors = ConfigValidator.validateParserConfig(config);
    setValidationErrors(errors);
  }, [config]);

  const handleFieldChange = <K extends keyof DictionaryParserConfig>(
    field: K,
    value: DictionaryParserConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setTestResult(null); // Clear test result when config changes
  };

  const handleTest = async () => {
    if (!onTest || !file || validationErrors.length > 0) return;

    setTesting(true);
    try {
      const result = await onTest(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        sampleResults: [],
        errors: [error instanceof Error ? error.message : "Test failed"],
        performance: { queryTime: 0, parseTime: 0 },
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (validationErrors.length === 0) {
      onSave(config);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">
          Custom Parser Configuration
        </h3>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Configuration Errors:
                </h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Basic Information</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Parser name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Version
              </label>
              <input
                type="text"
                value={config.version}
                onChange={(e) => handleFieldChange("version", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="1.0.0"
              />
            </div>
          </div>
        </div>

        {/* SQL Query */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            SQL Query
            <span className="text-gray-500 font-normal ml-1">
              (Use ? as placeholders)
            </span>
          </label>
          <textarea
            value={config.sqlQuery}
            onChange={(e) => handleFieldChange("sqlQuery", e.target.value)}
            rows={6}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
            placeholder="SELECT * FROM terms WHERE..."
          />
          <p className="text-xs text-gray-500">
           {` Example: SELECT * FROM terms WHERE "0" = ? ORDER BY length("0") DESC
            LIMIT 20`}
          </p>
        </div>

        {/* Column Mapping */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Column Mapping</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config.columnMapping).map(([field, value]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field} Column
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleFieldChange("columnMapping", {
                      ...config.columnMapping,
                      [field]: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Meaning Parser */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Meaning Parser</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parser Type
            </label>
            <select
              value={config.meaningParser.type}
              onChange={(e) =>
                handleFieldChange("meaningParser", {
                  ...config.meaningParser,
                  // TODO provide type!
                  type: e.target.value as "string" | "array" | "json" | "custom",
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
                <span className="text-gray-500 font-normal ml-1">
                  (JavaScript)
                </span>
              </label>
              <textarea
                value={config.meaningParser.customFunction || ""}
                onChange={(e) =>
                  handleFieldChange("meaningParser", {
                    ...config.meaningParser,
                    customFunction: e.target.value,
                  })
                }
                rows={8}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                placeholder={CUSTOM_FN_EXAMPLE}
              />
              <p className="text-xs text-gray-500 mt-1">
                Function should accept rawContent parameter and return string
                array
              </p>
            </div>
          )}
        </div>

        {/* Search Strategy */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Search Strategy</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Strategy Type
            </label>
            <select
              value={config.searchStrategy.type}
              onChange={(e) =>
                handleFieldChange("searchStrategy", {
                  ...config.searchStrategy,
                  // TODO provide type!
                  type: e.target.value as "exact" | "partial" | "ngram",
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="exact">Exact Match</option>
              <option value="partial">Partial Match</option>
              <option value="ngram">N-gram Search</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.searchStrategy.includeSubstrings || false}
                onChange={(e) =>
                  handleFieldChange("searchStrategy", {
                    ...config.searchStrategy,
                    includeSubstrings: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include Substrings
              </span>
            </label>
          </div>
        </div>

        {/* Test Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Test Configuration</h4>
            <button
              onClick={handleTest}
              disabled={testing || !file || validationErrors.length > 0}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <TestTube className="w-4 h-4 mr-1" />
              {testing ? "Testing..." : "Test Parser"}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-md ${
                testResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center mb-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <span
                  className={`text-sm font-medium ${
                    testResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {testResult.success ? "Test Passed" : "Test Failed"}
                </span>
              </div>

              {testResult.errors.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-red-800">Errors:</h5>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {testResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {testResult.sampleResults.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700">
                    Sample Results:
                  </h5>
                  <div className="mt-1 space-y-1">
                    {testResult.sampleResults.slice(0, 3).map((result, i) => (
                      <div
                        key={i}
                        className="text-xs bg-white p-2 rounded border"
                      >
                        <div className="font-medium">
                          {result.word} ({result.reading})
                        </div>
                        <div className="text-gray-600">
                          {result.meanings.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600">
                Performance: Query {testResult.performance.queryTime.toFixed(1)}
                ms, Parse {testResult.performance.parseTime.toFixed(1)}ms
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={validationErrors.length > 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
