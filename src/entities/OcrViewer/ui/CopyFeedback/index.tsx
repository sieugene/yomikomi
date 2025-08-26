import { Copy } from "lucide-react";
import React from "react";

export const CopyFeedback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center text-green-700">
        <Copy className="w-4 h-4 mr-2" />
        {message}
      </div>
    </div>
  );
};
