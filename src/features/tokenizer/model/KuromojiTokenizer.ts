import kuromoji from "kuromoji";

export class KuromojiTokenizer {
  private tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

  constructor() {}

  public async init() {
    return new Promise<void>((resolve, reject) => {
      kuromoji.builder({ dicPath: "/kuromoji" }).build((err, tokenizer) => {
        if (err) {
          console.error("Tokenizer build failed", err);
          return reject(err);
        }
        this.tokenizer = tokenizer;
        resolve();
      });
    });
  }

  public tokenize(text: string) {
    if (!this.tokenizer) throw new Error("Tokenizer not initialized");
    return this.tokenizer.tokenize(text);
  }
}
