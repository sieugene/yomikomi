import { DictionaryMetadata } from "@/features/dictionary/types";
import { AlertTriangle, CheckCircle, Database, Download } from "lucide-react";
import { StatCard, StatKey } from "../types";

export const useDictionariesStats = (
  dictionaries: DictionaryMetadata[],
  formattedTotalSize: string
) => {
  const stats: { [key in StatKey]: number } = {
    total: dictionaries.length,
    active: dictionaries.filter((d) => d.status === "active").length,
    inactive: dictionaries.filter((d) => d.status === "inactive").length,
    error: dictionaries.filter((d) => d.status === "error").length,
  };
  const statsCards: StatCard[] = [
    {
      icon: Database,
      value: stats.total,
      label: "Total Dictionaries",
      color: "text-blue-600",
    },
    {
      icon: CheckCircle,
      value: stats.active,
      label: "Active",
      color: "text-green-600",
    },
    {
      icon: AlertTriangle,
      value: stats.inactive,
      label: "Inactive",
      color: "text-yellow-600",
    },
    {
      icon: Download,
      value: formattedTotalSize,
      label: "Storage Used",
      color: "text-purple-600",
    },
  ];
  return { stats, statsCards };
};
