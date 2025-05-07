import JSZip from "jszip";
import type { SqlJsStatic, Database } from "sql.js";

export class Deck {
  private db: Database | null = null;

  constructor(private sqlClient: SqlJsStatic, private zipFile: File) {}

  async init(): Promise<void> {
    const zip = await JSZip.loadAsync(this.zipFile);
    const dbFile = await zip.file("collection.anki21")?.async("uint8array");
    if (!dbFile) throw new Error("No collection.anki21 file found in the zip");

    this.db = new this.sqlClient.Database(dbFile);
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
        // @ts-ignore
        collection[column] = JSON.parse(values[index] || "{}");
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
  async getMedia(mediaFileName = "media"): Promise<Record<string, string>> {
    const zip = await JSZip.loadAsync(this.zipFile);
    const mediaFileEntry = zip.file(mediaFileName);
    if (!mediaFileEntry)
      throw new Error(`Media file not found: ${mediaFileName}`);

    const buf = await mediaFileEntry.async("string");

    try {
      return JSON.parse(buf);
    } catch (e) {
      console.warn("Failed to parse media as JSON, trying as Proxy Buffer...");
    }

    console.error("Decoding as protobuf is not yet implemented");
    return {};
  }
}
