import { DictionaryTemplateSelector } from "@/entities/DictionaryTemplateSelector/ui";
import { DictionaryCustomTemplateEditor } from "@/entities/DictionaryCustomTemplateEditor/ui";
import { STEPS } from "../../types";
import { SelectFileStep } from "../SelectFileStep";
import { CUSTOM_TEMPLATE_ID } from "../../constants/dictionary-add.constants";
import type { UseAddDictionaryFlowReturn } from "../../hooks/useAddDictionaryFlow";
import { FC } from "react";
import { FinalStep } from '../FinalStep';

type Props = UseAddDictionaryFlowReturn;
export const AddDictionarySteps: FC<Props> = ({
  step,
  selectedFile,
  selectedTemplateId,
  selectedTemplate,
  customConfig,
  adding,
  testParser,
  handleFileSelect,
  handleTemplateSelect,
  handleCustomConfigSave,
  handleAdd,
  setStep,
}) => {
  switch (step) {
    case STEPS.SELECT_FILE_STEP:
      return (
        <SelectFileStep
          handleFileSelect={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      );

    case STEPS.TEMPLATE_SELECT_STEP:
      return (
        <DictionaryTemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          customTemplateId={CUSTOM_TEMPLATE_ID}
        />
      );

    case STEPS.CUSTOM_TEMPLATE_EDITOR_STEP:
      return (
        <DictionaryCustomTemplateEditor
          initialConfig={customConfig || undefined}
          onSave={handleCustomConfigSave}
          onTest={
            selectedFile
              ? (config) => testParser(selectedFile, config)
              : undefined
          }
          file={selectedFile || undefined}
        />
      );

    case STEPS.FINAL_STEP:
      return (
        <FinalStep
          handleAdd={handleAdd}
          loading={adding}
          onBackClick={() => {
            setStep(
              selectedTemplateId === CUSTOM_TEMPLATE_ID
                ? STEPS.CUSTOM_TEMPLATE_EDITOR_STEP
                : STEPS.TEMPLATE_SELECT_STEP
            );
          }}
          selectedFile={selectedFile}
          selectedTemplate={selectedTemplate}
        />
      );

    default:
      return null;
  }
};
