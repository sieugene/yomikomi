import { Media as DeckMedia } from "../model/Deck";

export type Note = {
  id: string;
  noteId: string;
  fields: string;
  createdAt: Date;
  updatedAt: Date;
  collectionId: string;
};

export type Media = {
  type: string;
  id: string;
  path: string;
  originalName: string;
  createdAt: Date;
  updatedAt: Date;
  collectionId: string;
};

type LocalOrRemoteMedia = Media &
  Partial<Pick<DeckMedia, "getBlob" | "revokeBlob">>;
export type FormattedImportData = {
  note: Partial<Omit<Note, "fields">> & {
    fields: Record<string, string>;
  };
  media: LocalOrRemoteMedia[];
};
