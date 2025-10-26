import { FC } from "react";

interface CaptureInstructionsProps {
  hasSelection: boolean;
  isAnalyzing: boolean;
}

export const CaptureInstructions: FC<CaptureInstructionsProps> = ({
  hasSelection,
  isAnalyzing,
}) => {
  const getMessage = () => {
    if (!hasSelection) return "Drag to select text area";
    if (isAnalyzing) return "Analyzing...";
    return "Tap 'Analyze' to look up words";
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-3 sm:px-4 py-2 sm:py-3 animate-in slide-in-from-top duration-300">
      <p className="text-xs sm:text-sm text-blue-800 text-center font-medium">
        {getMessage()}
      </p>
    </div>
  );
};