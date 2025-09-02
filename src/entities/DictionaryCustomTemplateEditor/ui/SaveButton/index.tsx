import React from "react";
import { Save } from "lucide-react";

export const SaveButton: React.FC<{ disabled: boolean; onClick: () => void }> = ({ disabled, onClick }) => (
  <div className="flex justify-end pt-4 border-t">
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
    >
      <Save className="w-4 h-4 mr-2" />
      Save Configuration
    </button>
  </div>
);
