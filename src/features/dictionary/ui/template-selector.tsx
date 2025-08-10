import React, { useState } from "react";
import { Settings, Plus, Eye, Code } from "lucide-react";
import { DictionaryTemplate } from "../types/types";

interface TemplateSelectorProps {
  templates: DictionaryTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  onCustomTemplate: () => void;
  onViewTemplate?: (template: DictionaryTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onCustomTemplate,
  onViewTemplate,
}) => {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const handleViewTemplate = (
    template: DictionaryTemplate,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (onViewTemplate) {
      onViewTemplate(template);
    } else {
      setExpandedTemplate(
        expandedTemplate === template.id ? null : template.id
      );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Parser Template</h3>
      <p className="text-sm text-gray-600">
        Select a predefined template or create a custom parser configuration.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div
              onClick={() => onTemplateSelect(template.id)}
              className={`p-4 cursor-pointer transition-colors hover:border-blue-500 ${
                selectedTemplateId === template.id
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium flex items-center">
                    {template.name}
                    {selectedTemplateId === template.id && (
                      <span className="ml-2 text-blue-600">
                        <Settings className="w-4 h-4" />
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                      {template.language.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      v{template.config.version}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleViewTemplate(template, e)}
                  className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View template details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded template details */}
            {expandedTemplate === template.id && (
              <div className="border-t bg-gray-50 p-4">
                <div className="space-y-3">
                  {template.example && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">
                        Example Output:
                      </h5>
                      <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                        {template.example}
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
                          {template.config.searchStrategy.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Meaning Parser:</span>
                        <span className="ml-1 font-mono">
                          {template.config.meaningParser.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      SQL Query Preview:
                    </h5>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-20">
                      {template.config.sqlQuery.trim()}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Custom template option */}
        <div
          onClick={onCustomTemplate}
          className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-blue-500 ${
            selectedTemplateId === "custom"
              ? "bg-blue-50 border-blue-500"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center">
                Custom Parser
                {selectedTemplateId === "custom" && (
                  <span className="ml-2 text-blue-600">
                    <Settings className="w-4 h-4" />
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600">
                Create your own parsing configuration with custom SQL and
                JavaScript functions
              </p>
              <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded mt-2">
                CUSTOM
              </span>
            </div>
            <div className="text-blue-600">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
