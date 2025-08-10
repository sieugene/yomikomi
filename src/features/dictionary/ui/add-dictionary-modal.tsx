import React, { useState } from "react";
import { XCircle, Upload, Database } from "lucide-react";
import { TemplateSelector } from "../ui/template-selector";
import { CustomTemplateEditor } from "../ui/custom-template-editor";
import {
  DictionaryParserConfig,
  DictionaryTemplate,
  ParserTestResult,
} from "../types/types";
import { formatFileSize } from "../lib/formatters";

interface AddDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: DictionaryTemplate[];
  onAdd: (
    file: File,
    templateId?: string,
    customConfig?: DictionaryParserConfig
  ) => Promise<string>;
  onTest: (
    file: File,
    config: DictionaryParserConfig,
    testTokens?: string[]
  ) => Promise<ParserTestResult>;
}

export const AddDictionaryModal: React.FC<AddDictionaryModalProps> = ({
  isOpen,
  onClose,
  templates,
  onAdd,
  onTest,
}) => {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customConfig, setCustomConfig] =
    useState<DictionaryParserConfig | null>(null);
  const [testResult, setTestResult] = useState<ParserTestResult | null>(null);
  const [adding, setAdding] = useState(false);

  const resetModal = () => {
    setStep(1);
    setSelectedFile(null);
    setSelectedTemplateId("");
    setCustomConfig(null);
    setTestResult(null);
    setAdding(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStep(2);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === "custom") {
      setStep(3); // Go to custom editor
    } else {
      setStep(4); // Go to confirmation
    }
  };

  const handleCustomTemplate = () => {
    setSelectedTemplateId("custom");
    setStep(3);
  };

  const handleCustomConfigSave = (config: DictionaryParserConfig) => {
    setCustomConfig(config);
    setStep(4);
  };

  const handleAdd = async () => {
    if (!selectedFile) return;

    setAdding(true);
    try {
      await onAdd(selectedFile, selectedTemplateId, customConfig || undefined);
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

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const currentConfig = customConfig || selectedTemplate?.config;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Dictionary</h2>
            <button
              onClick={() => {
                resetModal();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`w-16 h-0.5 ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Dictionary File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Choose SQLite dictionary file
                  </p>
                  <input
                    type="file"
                    accept=".sqlite,.db"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="dictionary-file"
                  />
                  <label
                    htmlFor="dictionary-file"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <TemplateSelector
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={handleTemplateSelect}
                onCustomTemplate={handleCustomTemplate}
              />
            )}

            {step === 3 && (
              <CustomTemplateEditor
                initialConfig={customConfig || undefined}
                onSave={handleCustomConfigSave}
                onTest={
                  selectedFile
                    ? (config) => {
                        debugger;
                        return onTest(selectedFile, config);
                      }
                    : undefined
                }
                file={selectedFile || undefined}
              />
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Ready to Add Dictionary</h3>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <strong>File:</strong> {selectedFile?.name}
                  </div>
                  <div>
                    <strong>Size:</strong>{" "}
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : "Unknown"}
                  </div>
                  <div>
                    <strong>Template:</strong>{" "}
                    {selectedTemplate?.name || "Custom"}
                  </div>
                  {selectedTemplate && (
                    <div>
                      <strong>Language:</strong>{" "}
                      {selectedTemplate.language.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={adding || !selectedFile}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {adding ? "Adding..." : "Add Dictionary"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
