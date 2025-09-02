import React from "react";
import { AlertCircle } from "lucide-react";

export const ValidationErrors: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
      <div className="flex">
        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2" />
        <div>
          <h4 className="text-sm font-medium text-red-800">Configuration Errors:</h4>
          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
