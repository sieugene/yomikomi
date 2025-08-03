import { Dictionary } from "@/services";
import { IpadicFeatures } from "kuromoji";

export class DictLookupCase {
  constructor(private readonly dictionaryService: Dictionary) {}
  async lookup(sentence: string, tokens: IpadicFeatures[]) {
    if (!sentence || !tokens.length) {
      return {
        status: 400,
        error: "The offer is not specified or the tokenizer is not ready",
      };
    }
    const surfaceForms = tokens.map((token) => token.surface_form);
    const words = tokens.map((token) => token.basic_form);
    const searchByFirstSymbol = words.map((w) => w[0]);
    const variants = [...surfaceForms, ...words, ...searchByFirstSymbol];

    const dictionaryResult = this.dictionaryService.find(variants);

    const data = { dictionaryResult, words, tokens, status: 200 };
    return data;
  }
}
