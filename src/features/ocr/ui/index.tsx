import { useState } from "react";
import { useOcrUpload } from "../hooks/useOcrUpload";
import { CopyFeedback } from "./CopyFeedback";
import { FileActions } from "./FileActions";
import { FileUploader } from "./FileUploader";
import { OcrFailure } from "./OcrFailure";
import { OcrProcessing } from "./OcrProcessing";
import { InteractiveOcrResult } from "@/entities/InteractiveOcrResult/ui";
import { useOCR } from "../hooks/useOCR";

export const OcrTool = () => {
  const {
    performOCR,
    result,
    isLoading,
    error,
    reset: handleReset,
    setCustomApi,
  } = useOCR();

  const {
    handleDragOver,
    handleDrop,
    handleFileInput,
    selectedFile,
    imageUrl,
    handleReset: resetUpload,
  } = useOcrUpload(handleReset);

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  return (
    <>
      <input
        type="hidden"
        id="customApi"
        onChange={({ target }) => {
          setCustomApi(target.value);
        }}
        placeholder='custom endpoint'
      />
      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <FileUploader
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleFileInput={handleFileInput}
        />

        <FileActions
          handlePerformOCR={async () => {
            if (selectedFile) {
              await performOCR(selectedFile);
            }
          }}
          handleReset={() => {
            resetUpload();
            handleReset();
          }}
          selectedFile={selectedFile}
          isLoading={isLoading}
        />
      </div>

      {copyFeedback && <CopyFeedback message={copyFeedback} />}

      {error && <OcrFailure error={error} />}

      {/* Results */}
      {result && imageUrl && (
        <InteractiveOcrResult
          imageUrl={imageUrl}
          result={result}
          setCopyFeedback={setCopyFeedback}
        />
      )}

      {/* Loading State */}
      {isLoading && <OcrProcessing />}
    </>
  );
};
