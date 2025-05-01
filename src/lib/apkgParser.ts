import { Deck, Unpack } from "./parser";

export async function parseApkg(apkgPath: string, outputDir: string) {
  const unpacker = new Unpack();

  await unpacker.unpack(apkgPath, outputDir);

  const deck = new Deck(outputDir);

  const notes = await deck.dbOpen().then((db) => db.getNotes());

  const mediaMap = await deck.getMedia();

  return { notes, mediaMap };
}
