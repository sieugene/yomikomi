import { DICTIONARY_CONFIG } from "../config/dict.config";
import { DictionaryEntry, DictionaryLookup } from "./DictionaryLookup";

type EntryData = [
  word: string,
  reading: string,
  type: string,
  extra: string,
  id: number,
  meanings: string[],
  entryId: number,
  notes: string
];

class DictionaryRu extends DictionaryLookup<EntryData> {
  parse(entry: EntryData): DictionaryEntry {
    return {
      word: entry[0],
      reading: entry[1],
      type: entry[2],
      meanings: entry[5],
    };
  }
}

export const RuDictionaryLookup = new DictionaryRu(
  DICTIONARY_CONFIG.dictList.ru.file
);
