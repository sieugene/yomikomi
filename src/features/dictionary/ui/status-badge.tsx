import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { DictionaryMetadata } from "../types/types";

interface StatusBadgeProps {
  status: DictionaryMetadata["status"];
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const config = {
    active: {
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
      text: "Active",
    },
    inactive: {
      icon: AlertTriangle,
      color: "text-yellow-600 bg-yellow-100",
      text: "Inactive",
    },
    error: {
      icon: XCircle,
      color: "text-red-600 bg-red-100",
      text: "Error",
    },
  }[status];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  );
};
