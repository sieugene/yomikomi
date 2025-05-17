import type { Database, SqlJsStatic } from "sql.js";
import type { Extractor } from "./Extractor";
import { DB_FILES } from "../lib/constants";
import FileManager from "./FileManager";

export type Media = {
  fileName: string;
  getBlob: () => Promise<string>;
  revokeBlob: () => void;
};

export class Deck {
  private db: Database | null = null;
  private fileManager = new FileManager();

  constructor(
    private deckName: string,
    private sqlClient: SqlJsStatic,
    private extractor: Extractor
  ) {}

  async init(): Promise<void> {
    const dbFile = await this.extractor.extractFile(DB_FILES.LEGACY);
    if (!dbFile)
      throw new Error(`No ${DB_FILES.LEGACY} file found in the archive`);

    this.db = new this.sqlClient.Database(new Uint8Array(dbFile));
  }

  async getNotes(): Promise<Record<string, any>> {
    if (!this.db) throw new Error("Database not initialized");
    const notes: Record<string, any> = {};

    const noteRows = this.db.exec("SELECT * FROM notes")[0]?.values || [];
    const cardRows = this.db.exec("SELECT * FROM cards")[0]?.values || [];

    for (const row of noteRows) {
      const [id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data] =
        row;
      notes[id as any] = {
        id,
        guid,
        mid,
        mod,
        usn,
        tags,
        flds,
        sfld,
        csum,
        flags,
        data,
        cards: [],
      };
    }

    for (const row of cardRows) {
      const [
        id,
        nid,
        did,
        ord,
        mod,
        usn,
        type,
        queue,
        due,
        ivl,
        factor,
        reps,
        lapses,
        left,
        odue,
        odid,
        flags,
        data,
      ] = row;
      if (notes[nid as any]) {
        notes[nid as any].cards.push({
          id,
          nid,
          did,
          ord,
          mod,
          usn,
          type,
          queue,
          due,
          ivl,
          factor,
          reps,
          lapses,
          left,
          odue,
          odid,
          flags,
          data,
        });
      }
    }

    return notes;
  }

  async getCollection(): Promise<any> {
    if (!this.db) throw new Error("Database not initialized");
    const res = this.db.exec("SELECT * FROM col");
    const columns = res[0]?.columns;
    const values = res[0]?.values[0];

    const collection: { [key: string]: any } = {};
    columns.forEach((column, index) => {
      if (
        column === "conf" ||
        column === "models" ||
        column === "decks" ||
        column === "dconf" ||
        column === "tags"
      ) {
        collection[column] = JSON.parse((values as any)[index] || "{}");
      } else {
        collection[column] = values[index];
      }
    });

    return collection;
  }

  async getModels(): Promise<any> {
    const col = await this.getCollection();
    return col.models || {};
  }

  async getMedia(mediaFileName = "media"): Promise<Media[]> {
    const mediaArray = await this.extractor.extractMedia(mediaFileName);

    return Promise.all(
      Object.keys(mediaArray).map(async (key) => {
        const fileName = mediaArray[key];
        const itemKey = `${this.deckName}-${fileName}-${key}`;

        return {
          fileName,
          getBlob: async () => {
            try {
              const hasFile = await this.fileManager
                .hasFile(itemKey)
                .catch((e) => null);

              if (!hasFile) {
                const file = await this.extractor.extractFile(key);
                if (file) {
                  await this.fileManager.saveFile(
                    new File([file], fileName),
                    itemKey
                  );
                }
              }
              const { url } = await this.fileManager.getFileUrl(itemKey);
              return url;
            } catch (error) {
              console.error(error);
              return "";
            }
          },
          revokeBlob: () => {
            if (itemKey) {
              this.fileManager.revokeFileUrl(itemKey);
            }
          },
        };
      })
    );
  }
}
