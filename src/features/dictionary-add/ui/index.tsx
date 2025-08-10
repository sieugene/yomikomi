import { AddDictionaryModal } from "@/features/dictionary-add/ui/AddDictionaryModal";
import { useDictionaryManager } from "@/features/dictionary/hooks/useDictionaryManager";
import { Plus } from "lucide-react";
import { useState } from "react";

export const AddDictionary = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Dictionary
      </button>
      <AddDictionaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
};
