import { useTemplates } from "@/features/dictionary/hooks";
import { DictionaryTemplate } from "@/features/dictionary/types";
import React, { useState } from "react";
import { CustomTemplateOption, Template } from "./Template";

interface TemplateSelectorProps {
  selectedTemplateId: DictionaryTemplate["id"];
  onTemplateSelect: (templateId: DictionaryTemplate["id"]) => void;
  customTemplateId: string;
}

export const DictionaryTemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  customTemplateId,
}) => {
  const { data: templates } = useTemplates();
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const handleViewTemplate = (template: DictionaryTemplate) => {
    setExpandedTemplate(expandedTemplate === template.id ? null : template.id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Parser Template</h3>
      <p className="text-sm text-gray-600">
        Select a predefined template or create a custom parser configuration.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <Template
            key={template.id}
            template={template}
            isExpanded={expandedTemplate === template.id}
            isSelected={selectedTemplateId === template.id}
            onExpand={() => handleViewTemplate(template)}
            onSelect={() => onTemplateSelect(template.id)}
          />
        ))}
        <CustomTemplateOption
          isSelected={selectedTemplateId === customTemplateId}
          onSelect={() => onTemplateSelect(customTemplateId)}
        />
      </div>
    </div>
  );
};
