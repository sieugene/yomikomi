import type { Database, SqlJsStatic } from 'sql.js';

export type ParsedResult = {
  word: string;
  reading: string;
  type: string;
  meanings: string[];
};

export abstract class DictionaryLookup<GlossaryEntry> {

  protected db: Database;
  constructor(
	protected readonly dictionaryName: string,
	dbFile: ArrayBuffer,
	protected readonly sqlClient: SqlJsStatic
  ) {
	this.db = new sqlClient.Database(new Uint8Array(dbFile));
  }

  abstract find(tokenizedWords: string[]): GlossaryEntry[];
  abstract parse(findResult: GlossaryEntry): ParsedResult;

}
