import { FC, useMemo } from "react";

type Props = {
  stepsCount: number;
  currentStep: number;
};
export const ProgressSteps: FC<Props> = ({ stepsCount, currentStep }) => {
  const steps = useMemo(
    () => Array.from(Array(stepsCount).keys()).map((s) => s + 1),
    [stepsCount]
  );

  return (
    <>
      {steps.map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= stepNum
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {stepNum}
          </div>
          {stepNum < stepsCount && (
            <div
              className={`w-16 h-0.5 ${
                currentStep > stepNum ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </>
  );
};
