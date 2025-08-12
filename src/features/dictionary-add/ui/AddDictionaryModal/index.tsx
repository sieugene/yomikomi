import { Modal } from "@/shared/ui/Modal";
import { useAddDictionaryFlow } from "../../hooks/useAddDictionaryFlow";
import { ProgressSteps } from "../ProgressSteps";
import { STEPS } from "../../types";
import { AddDictionarySteps } from "../AddDictionarySteps";

interface AddDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDictionaryModal = ({
  isOpen,
  onClose,
}: AddDictionaryModalProps) => {
  const flow = useAddDictionaryFlow(onClose);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        flow.reset();
        onClose();
      }}
      title="Add Dictionary"
      maxWidth="max-w-4xl"
    >
      <div className="flex items-center mb-8">
        <ProgressSteps stepsCount={STEPS.FINAL_STEP} currentStep={flow.step} />
      </div>
      <div className="min-h-[400px]">
        <AddDictionarySteps {...flow} />
      </div>
    </Modal>
  );
};
