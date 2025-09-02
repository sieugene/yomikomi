import { DictionaryTemplate } from "@/features/dictionary/types";
import { Eye, Plus, Settings } from "lucide-react";
import { FC } from "react";
import { TemplateExpandedView } from "../TemplateExpandedView";

type Props = {
  isSelected: boolean;
  template: DictionaryTemplate;
  isExpanded: boolean;
  onExpand: () => void;
  onSelect: () => void;
};
export const Template: FC<Props> = ({
  isSelected,
  template,
  isExpanded,
  onExpand,
  onSelect,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        onClick={onSelect}
        className={`p-4 cursor-pointer transition-colors hover:border-blue-500 ${
          isSelected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium flex items-center">
              {template.name}
              {isSelected && (
                <span className="ml-2 text-blue-600">
                  <Settings className="w-4 h-4" />
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
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
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="cursor-pointer ml-2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View template details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <TemplateExpandedView
          config={template.config}
          example={template.example}
        />
      )}
    </div>
  );
};

type CustomTemplateOptionProps = Pick<Props, "onSelect" | "isSelected">;
export const CustomTemplateOption: FC<CustomTemplateOptionProps> = ({
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-blue-500 ${
        isSelected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium flex items-center">
            Custom Parser
            {isSelected && (
              <span className="ml-2 text-blue-600">
                <Settings className="w-4 h-4" />
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-600">
            Create your own parsing configuration with custom SQL and JavaScript
            functions
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
  );
};
