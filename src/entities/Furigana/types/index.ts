import { DisplayToken } from '@/features/tokenizer/hooks/useDictTokenizer';

export type FuriganaMode = "hiragana" | "romaji" | "none";

export interface FuriganaTextProps {
  text?: string;
  tokens?: DisplayToken[];
  mode?: FuriganaMode;
  className?: string;
  selectedWordId?: number | null;
  onWordClick?: (token: DisplayToken, wordId: number) => void;
}