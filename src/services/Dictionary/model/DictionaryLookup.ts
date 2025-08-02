import { readFileSync } from "fs";
import path from "path";
import { DICTIONARY_CONFIG } from "../config/dict.config";

export interface DictionaryEntry {
  word: string;
  reading: string;
  type: string;
  meanings: string[];
}

interface DictionaryMethods<T> {
  parse(entry: T): void;
}

export abstract class DictionaryLookup<T extends unknown[]>
  implements DictionaryMethods<T>
{
  abstract parse(entry: T): DictionaryEntry;
  private basePath = path.join(DICTIONARY_CONFIG.basePath, "JMdict");
  private dictionary = [];
  private _isReady: boolean = false;

  constructor(private readonly dictionaryName: string) {}

  public init() {
    this.log("init");
    const dictionaryPath = path.join(
      this.basePath,
      `${this.dictionaryName}.json`
    );

    try {
      const data = readFileSync(dictionaryPath, "utf8");
      const jsonData = JSON.parse(data);
      this.dictionary = jsonData;
      this._isReady = true;
      this.log("was inited");
    } catch (err) {
      console.error(err);
      this._isReady = false;
      this.log("error");
    }
  }

  public find(tokenizedWords: string[]) {
    return tokenizedWords
      .map((word) => {
        const foundEntries = this.dictionary.filter(
          (entry: T) => entry?.[0] === word
        );
        return foundEntries.map((entry) => {
          return this.parse(entry);
        });
      })
      .flat()
      .filter((a) => a.meanings.length);
  }

  validate() {
    if (!this._isReady) {
      throw new Error(
        `dictionary ${this.dictionaryName} not inited or has errors`
      );
    }
  }

  get isReady() {
    return this._isReady;
  }

  private log(message: string) {
    console.log(
      `---- DictionaryLookup ${message}  [${this.dictionaryName}] -----`
    );
  }
}
