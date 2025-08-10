import { DictionaryMetadata } from "@/features/dictionary/types";

export type StatKey = DictionaryMetadata["status"] | "total";
export type StatCard = {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string;
  label: string;
  color: string;
};
