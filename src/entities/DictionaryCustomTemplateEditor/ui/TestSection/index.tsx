import React from "react";
import { DictionaryParserConfig, ParserTestResult } from "@features/dictionary/types";
import { AlertCircle, CheckCircle, TestTube } from "lucide-react";

interface Props {
  config: DictionaryParserConfig;
  onTest?: (config: DictionaryParserConfig) => Promise<ParserTestResult>;
  file?: File;
  testResult: ParserTestResult | null;
  setTestResult: (res: ParserTestResult | null) => void;
  testing: boolean;
  setTesting: (val: boolean) => void;
}

export const TestSection: React.FC<Props> = ({
  config,
  onTest,
  file,
  testResult,
  setTestResult,
  testing,
  setTesting,
}) => {
  const handleTest = async () => {
    if (!onTest || !file) return;
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

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Test Configuration</h4>
        <button
          onClick={handleTest}
          disabled={testing || !file}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <TestTube className="w-4 h-4 mr-1" />
          {testing ? "Testing..." : "Test Parser"}
        </button>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-md ${
            testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          } border`}
        >
          <div className="flex items-center mb-2">
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            )}
            <span className={`text-sm font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
              {testResult.success ? "Test Passed" : "Test Failed"}
            </span>
          </div>

          {testResult.errors.length > 0 && (
            <ul className="text-sm text-red-700 list-disc list-inside">
              {testResult.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}

          {testResult.sampleResults.length > 0 && (
            <div className="mt-3 space-y-1">
              {testResult.sampleResults.slice(0, 3).map((res, i) => (
                <div key={i} className="text-xs bg-white p-2 rounded border">
                  <div className="font-medium">{res.word} ({res.reading})</div>
                  <div className="text-gray-600">{res.meanings.slice(0, 2).join(", ")}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-600 mt-2">
            Performance: Query {testResult.performance.queryTime.toFixed(1)}ms, Parse {testResult.performance.parseTime.toFixed(1)}ms
          </div>
        </div>
      )}
    </div>
  );
};
