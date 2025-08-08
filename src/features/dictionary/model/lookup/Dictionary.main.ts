import type { SqlJsStatic } from "sql.js";
import { SUPPORTED_DICTIONARIES } from "../config/dict.config";
import { DictionaryLookupEn } from "./DictionaryParser.en";
import { DictionaryLookupRu } from "./DictionaryParser.ru";
import { DictionaryLookup, ParsedResult } from "./DictionaryLookup";

export type DictionariesInput = {
  [K in SUPPORTED_DICTIONARIES]?: ArrayBuffer;
};

export class Dictionary {
  private dictionaries: DictionaryLookup<{}>[] = [];
  constructor(
    private readonly input: DictionariesInput,
    sqlClient: SqlJsStatic
  ) {
    if (input[SUPPORTED_DICTIONARIES.en]) {
      this.dictionaries.push(
        new DictionaryLookupEn(
          "english",
          input[SUPPORTED_DICTIONARIES.en],
          sqlClient
        )
      );
    }
    if (input[SUPPORTED_DICTIONARIES.ru]) {
      this.dictionaries.push(
        new DictionaryLookupRu(
          "russian",
          input[SUPPORTED_DICTIONARIES.ru],
          sqlClient
        )
      );
    }
  }

  find(tokenizedWords: string[]) {
    return this.dictionaries.reduce((parsedResult, dictionary) => {
      const results = dictionary
        .find(tokenizedWords)
        .map((e) => dictionary.parse(e));
      return [...parsedResult, ...results];
    }, [] as ParsedResult[]);
  }
}
