import { useState } from "react";
import { useAddDictionary } from "../hooks/useAddDictionary";
import { useCreateTemplate } from "../hooks/useCreateTemplate";
import { useTemplateById } from "../../dictionary/hooks/useTemplates";
import { STEPS, CUSTOM_TEMPLATE_ID } from "../constants/dictionary-add.constants";
import { DictionaryParserConfig, DictionaryTemplate } from "../types";


export type UseAddDictionaryFlowReturn = ReturnType<typeof useAddDictionaryFlow>
export const useAddDictionaryFlow = (onClose: () => void) => {
  const { addDictionary, testParser } = useAddDictionary();
  const { addCustomTemplate } = useCreateTemplate();

  const [step, setStep] = useState(STEPS.SELECT_FILE_STEP);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customConfig, setCustomConfig] =
    useState<DictionaryParserConfig | null>(null);
  const [adding, setAdding] = useState(false);

  const selectedTemplate = useTemplateById(selectedTemplateId);

  const reset = () => {
    setStep(STEPS.SELECT_FILE_STEP);
    setSelectedFile(null);
    setSelectedTemplateId("");
    setCustomConfig(null);
    setAdding(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStep(STEPS.TEMPLATE_SELECT_STEP);
  };

  const handleTemplateSelect = (templateId: DictionaryTemplate["id"]) => {
    setSelectedTemplateId(templateId);
    setStep(
      templateId === CUSTOM_TEMPLATE_ID
        ? STEPS.CUSTOM_TEMPLATE_EDITOR_STEP
        : STEPS.FINAL_STEP
    );
  };

  const handleCustomConfigSave = (config: DictionaryParserConfig) => {
    setCustomConfig(config);
    setStep(STEPS.FINAL_STEP);
  };

  const handleAdd = async () => {
    if (!selectedFile) return;
    setAdding(true);
    try {
      await addDictionary(selectedFile, selectedTemplateId, customConfig || undefined);
      // saving template if user choice custom
      if (customConfig) {
        await addCustomTemplate(customConfig);
      }
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setAdding(false);
    }
  };

  return {
    step,
    setStep,
    selectedFile,
    selectedTemplateId,
    customConfig,
    adding,
    selectedTemplate,
    testParser,
    handleFileSelect,
    handleTemplateSelect,
    handleCustomConfigSave,
    handleAdd,
    reset,
  };
};
