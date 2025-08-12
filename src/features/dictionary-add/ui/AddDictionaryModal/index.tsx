import { DictionaryTemplateSelector } from "@/entities/DictionaryTemplateSelector/ui";
import { CustomTemplateEditor } from "@/features/dictionary-add/ui/CustomTemplateEditor";
import { useTemplateById } from "@/features/dictionary/hooks/useTemplates";
import { Modal } from "@/shared/ui/Modal";
import {
  DictionaryParserConfig,
  DictionaryTemplate,
} from "@features/dictionary/types";
import React, { useMemo, useState } from "react";
import { CUSTOM_TEMPLATE_ID } from "../../constants/dictionary-add.constants";
import { useAddDictionary } from "../../hooks/useAddDictionary";
import { useCreateTemplate } from "../../hooks/useCreateTemplate";
import { STEPS } from "../../types";
import { FinalStep } from "../FinalStep";
import { ProgressSteps } from "../ProgressSteps";
import { SelectFileStep } from "../SelectFileStep";

interface AddDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDictionaryModal: React.FC<AddDictionaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addDictionary, testParser } = useAddDictionary();

  const [step, setStep] = useState(STEPS.SELECT_FILE_STEP);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customConfig, setCustomConfig] =
    useState<DictionaryParserConfig | null>(null);
  const [adding, setAdding] = useState(false);
  const { addCustomTemplate } = useCreateTemplate();
  const selectedTemplate = useTemplateById(selectedTemplateId);

  const resetModal = () => {
    setStep(STEPS.SELECT_FILE_STEP);
    setSelectedFile(null);
    setSelectedTemplateId("");
    setCustomConfig(null);
    setAdding(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStep(STEPS.TEMPLATE_SELECT_STEP);
    }
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
      await addDictionary(
        selectedFile,
        selectedTemplateId,
        customConfig || undefined
      );
      if (customConfig) {
        await addCustomTemplate(customConfig);
      }

      resetModal();
      onClose();
    } catch (error) {
      console.error("Failed to add dictionary:", error);
      alert(
        `Failed to add dictionary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setAdding(false);
    }
  };

  const steps = [
    {
      step: STEPS.SELECT_FILE_STEP,
      content: <SelectFileStep handleFileSelect={handleFileSelect} />,
    },
    {
      step: STEPS.TEMPLATE_SELECT_STEP,
      content: (
        <DictionaryTemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          customTemplateId={CUSTOM_TEMPLATE_ID}
        />
      ),
    },
    {
      step: STEPS.CUSTOM_TEMPLATE_EDITOR_STEP,
      content: (
        <CustomTemplateEditor
          initialConfig={customConfig || undefined}
          onSave={handleCustomConfigSave}
          onTest={
            selectedFile
              ? (config) => testParser(selectedFile, config)
              : undefined
          }
          file={selectedFile || undefined}
        />
      ),
    },
    {
      step: STEPS.FINAL_STEP,
      content: (
        <FinalStep
          handleAdd={handleAdd}
          loading={adding}
          onBackClick={() => {
            if (selectedTemplateId === CUSTOM_TEMPLATE_ID) {
              setStep(STEPS.CUSTOM_TEMPLATE_EDITOR_STEP);
            } else {
              setStep(STEPS.TEMPLATE_SELECT_STEP);
            }
          }}
          selectedFile={selectedFile}
          selectedTemplate={selectedTemplate}
        />
      ),
    },
  ];
  const currentStepContent = useMemo(() => {
    return steps.find((s) => s.step === step)?.content;
  }, [steps, step]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetModal();
        onClose();
      }}
      title="Add Dictionary"
      maxWidth="max-w-4xl"
    >
      <div className="flex items-center mb-8">
        <ProgressSteps stepsCount={STEPS.FINAL_STEP} currentStep={step} />
      </div>

      <div className="min-h-[400px]">{currentStepContent || <></>}</div>
    </Modal>
  );
};
