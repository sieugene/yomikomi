import { useSearchCore } from "@/features/dictionary-search/hooks/useSearchCore";
import { DictionaryEntry } from "@/features/dictionary/types";
import { IpadicFeatures } from "kuromoji";

const MAX_NGRAM_LENGTH = 3

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

function mergeTokensAsIpadic(
  tokens: IpadicFeatures[],
  dictionaryEntries: DictionaryEntry[]
): IpadicFeatures[] {
  const wordMap = new Map<string, DictionaryEntry>();
  dictionaryEntries.forEach((entry) => wordMap.set(entry.word, entry));

  const merged: IpadicFeatures[] = [];
  let i = 0;

  while (i < tokens.length) {
    let found = false;

    for (let n = 3; n > 0; n--) {
      if (i + n - 1 >= tokens.length) continue;

      const combined = tokens
        .slice(i, i + n)
        .map((t) => t.basic_form || t.surface_form)
        .join("");

      const entry = wordMap.get(combined);
      if (entry) {
        const firstToken = tokens[i];

        merged.push({
          word_id: firstToken.word_id, // можно сгенерировать уникальный, если нужно
          word_type: "KNOWN",
          word_position: firstToken.word_position,
          surface_form: combined,
          pos: firstToken.pos,
          pos_detail_1: firstToken.pos_detail_1,
          pos_detail_2: firstToken.pos_detail_2,
          pos_detail_3: firstToken.pos_detail_3,
          conjugated_type: firstToken.conjugated_type,
          conjugated_form: firstToken.conjugated_form,
          basic_form: combined,
          reading: entry.reading || undefined,
        });

        i += n;
        found = true;
        break;
      }
    }

    if (!found) {
      merged.push(tokens[i]);
      i += 1;
    }
  }

  return merged;
}

export const useDictTokenizer = () => {
  const { coordinator } = useSearchCore();
  const onFill = async (tokens: IpadicFeatures[]) => {
    const by_basic = tokens.map((t) => t.basic_form);
    const combinations = uniqueArray(generateTokenCombinations(by_basic, 2)); // пары токенов

    if (coordinator) {
      const foundEntries = await coordinator.checkTokensAsync(combinations);
      return mergeTokensAsIpadic(tokens, foundEntries);
    }
    return tokens;
  };

  return { onFill };
};
