import { DictionaryTemplate } from "@/features/dictionary/types";
import { FC } from "react";

type Props = {
  example: DictionaryTemplate["example"];
  config: DictionaryTemplate["config"];
};
export const TemplateExpandedView: FC<Props> = ({ config, example }) => {
  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="space-y-3">
        {example && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">
              Example Output:
            </h5>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              {example}
            </pre>
          </div>
        )}

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">
            Configuration:
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Search Strategy:</span>
              <span className="ml-1 font-mono">
                {config.searchStrategy.type}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Meaning Parser:</span>
              <span className="ml-1 font-mono">
                {config.meaningParser.type}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">
            SQL Query Preview:
          </h5>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-20">
            {config.sqlQuery.trim()}
          </pre>
        </div>
      </div>
    </div>
  );
};
