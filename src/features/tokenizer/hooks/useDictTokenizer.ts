import { useSearchCore } from "@/features/dictionary-search/hooks/useSearchCore";
import { DictionaryEntry } from "@/features/dictionary/types";
import { IpadicFeatures } from "kuromoji";

const MAX_NGRAM_LENGTH = 3;

function generateTokenCombinations(tokens: string[], maxN = MAX_NGRAM_LENGTH) {
  const combinations: string[] = [];

  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join("");
      combinations.push(ngram);
    }
  }

  return combinations;
}

function uniqueArray(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

// types
export type DisplayToken = IpadicFeatures & {
  source: "kuromoji" | "dict";
};

// merge
function mergeTokensAsIpadic(
  tokens: IpadicFeatures[],
  dictionaryEntries: DictionaryEntry[]
): DisplayToken[] {
  const wordMap = new Map<string, DictionaryEntry>();
  dictionaryEntries.forEach((entry) => wordMap.set(entry.word, entry));

  const merged: DisplayToken[] = [];
  let i = 0;

  while (i < tokens.length) {
    let found = false;

    for (let n = MAX_NGRAM_LENGTH; n > 0; n--) {
      if (i + n - 1 >= tokens.length) continue;

      const slice = tokens.slice(i, i + n);
      const combinedBasic = slice
        .map((t) => t.basic_form || t.surface_form)
        .join("");
      const combinedSurface = slice.map((t) => t.surface_form).join("");

      const entry = wordMap.get(combinedBasic);
      if (entry) {
        const firstToken = slice[0];

        merged.push({
          ...firstToken,
          surface_form: combinedSurface,
          basic_form: combinedBasic,
          word_type: "KNOWN",
          reading: entry.reading || firstToken.reading,
          source: "dict",
        });

        i += n;
        found = true;
        break;
      }
    }

    if (!found) {
      merged.push({ ...tokens[i], source: "kuromoji" });
      i += 1;
    }
  }

  return merged;
}

export const useDictTokenizer = () => {
  const { coordinator } = useSearchCore();

  const onFill = async (tokens: IpadicFeatures[]): Promise<DisplayToken[]> => {
    const by_basic = tokens.map((t) => t.basic_form);
    const combinations = uniqueArray(generateTokenCombinations(by_basic));

    if (coordinator) {
      const foundEntries = await coordinator.checkTokensAsync(combinations);
      return mergeTokensAsIpadic(tokens, foundEntries);
    }
    return [];
  };

  return { onFill };
};
