import kuromoji from "kuromoji";
import path from "path";
import { DICTIONARY_CONFIG } from "../Dictionary/config/dict.config";

export class Kuromoji {
  private dicPath = path.join(DICTIONARY_CONFIG.basePath, "kuromoji");
  private _tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

  constructor() {
    this.init();
  }

  private init() {
    kuromoji.builder({ dicPath: this.dicPath }).build((err, builtTokenizer) => {
      if (err) {
        console.error("Tokenizer construction error:", err);
        return;
      }
      this.tokenizer = builtTokenizer;
    });
  }
  get tokenizer() {
    return this._tokenizer;
  }
  set tokenizer(tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null) {
    this._tokenizer = tokenizer;
  }
}
