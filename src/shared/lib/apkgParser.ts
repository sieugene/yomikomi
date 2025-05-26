import { Deck, Unpack } from "./parser";

type AwaitedReturnType<T> = T extends (...args: unknown[]) => Promise<infer R>
  ? R
  : never;
export type ParseApkgData = AwaitedReturnType<typeof parseApkg>;
export async function parseApkg(apkgPath: string, outputDir: string) {
  const sqlite3 = (await import("sqlite3")).default;
  const unpacker = new Unpack();

  await unpacker.unpack(apkgPath, outputDir);
  const deck = new Deck(outputDir, sqlite3.Database);

  const mediaMap = await deck.getMedia();

  const db = await deck.dbOpen();
  const notesRaw = await db.getNotes();
  const models = await db.getModels();

  const notes = Object.values(notesRaw).map((note) => {
    const model = models[note.mid];
    const fieldNames: string[] = model.flds.map(
      (f: { name: string }) => f.name
    );
    const values = note.flds.split("\x1f");
    const fields: Record<string, string> = {};
    fieldNames.forEach((name, idx) => {
      fields[name] = values[idx] ?? "";
    });
    return {
      id: note.id as string,
      fields,
    };
  });

  return { notes, mediaMap };
}
