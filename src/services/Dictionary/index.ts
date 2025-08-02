import { DictionaryEntry, DictionaryLookup } from "./model/DictionaryLookup";

export class Dictionary {
  constructor(private readonly dictionaries: DictionaryLookup<any>[]) {
    dictionaries.forEach((d) => {
      d.init();
    });
  }

  find(tokenizedWords: string[]) {
    return this.dictionaries.reduce((findResult, dict) => {
      const prev = [...findResult];
      return [...prev, ...dict.find(tokenizedWords)];
    }, [] as DictionaryEntry[]);
  }
}
