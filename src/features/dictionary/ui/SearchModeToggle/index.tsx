import React from "react";
import { Zap, ZapOff } from "lucide-react";

interface SearchModeToggleProps {
  deepMode: boolean;
  onToggle: () => void;
  className?: string;
}

export const SearchModeToggle: React.FC<SearchModeToggleProps> = ({
  deepMode,
  onToggle,
  className = "",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        deepMode
          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      } ${className}`}
      title={deepMode ? "Switch to fast search" : "Switch to deep search"}
    >
      {deepMode ? (
        <>
          <ZapOff className="w-3 h-3 mr-1" />
          Deep Search
        </>
      ) : (
        <>
          <Zap className="w-3 h-3 mr-1" />
          Fast Search
        </>
      )}
    </button>
  );
};
