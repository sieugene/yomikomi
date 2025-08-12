import React from "react";
import {
  DictionaryParserConfig,
  ParserTestResult,
} from "@features/dictionary/types";
import { useCustomTemplateConfig } from "../hooks/useCustomTemplateConfig";
import { ValidationErrors } from "./ValidationErrors";
import { BasicInfoSection } from "./BasicInfoSection";
import { SqlQuerySection } from "./SqlQuerySection";
import { ColumnMappingSection } from "./ColumnMappingSection";
import { MeaningParserSection } from "./MeaningParserSection";
import { SearchStrategySection } from "./SearchStrategySection";
import { TestSection } from "./TestSection";
import { SaveButton } from "./SaveButton";

interface Props {
  initialConfig?: DictionaryParserConfig;
  onSave: (config: DictionaryParserConfig) => void;
  onTest?:
    | ((config: DictionaryParserConfig) => Promise<ParserTestResult>)
    | undefined;
  file?: File;
}

export const DictionaryCustomTemplateEditor: React.FC<Props> = ({
  initialConfig,
  onSave,
  onTest,
  file,
}) => {
  const {
    config,
    updateField,
    validationErrors,
    testResult,
    setTestResult,
    testing,
    setTesting,
  } = useCustomTemplateConfig(initialConfig);

  return (
    <div className="space-y-6">
      <ValidationErrors errors={validationErrors} />
      <BasicInfoSection config={config} onChange={updateField} />
      <SqlQuerySection config={config} onChange={updateField} />
      <ColumnMappingSection config={config} onChange={updateField} />
      <MeaningParserSection config={config} onChange={updateField} />
      <SearchStrategySection config={config} onChange={updateField} />
      <TestSection
        {...{
          config,
          onTest,
          file,
          testResult,
          setTestResult,
          testing,
          setTesting,
        }}
      />
      <SaveButton
        disabled={validationErrors.length > 0}
        onClick={() => onSave(config)}
      />
    </div>
  );
};
