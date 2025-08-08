import { termsSelectSqlQuery } from "../lib/terms-select-sql-query";
import { DictionaryLookup, ParsedResult } from "./DictionaryLookup";

type GlossaryEntry = [
  word: string,
  reading: string,
  type: string,
  extra: string,
  id: number,
  meanings: string[],
  entryId: number,
  notes: string
];

export class DictionaryLookupRu extends DictionaryLookup<GlossaryEntry> {
  parse(entry: GlossaryEntry): ParsedResult {
    return {
      word: entry[0],
      reading: entry[1],
      type: entry[2],
      meanings: entry[5],
    };
  }
  // TODO duplicate
  find(tokenizedWords: string[]): GlossaryEntry[] {
    return termsSelectSqlQuery<GlossaryEntry>(tokenizedWords, this.db);
  }
}
