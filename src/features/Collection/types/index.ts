import { Media as DeckMedia } from "@/features/AnkiParser/model/Deck";
import { Media, Note } from '@/shared/types';


type LocalOrRemoteMedia = Media &
  Partial<Pick<DeckMedia, "getBlob" | "revokeBlob">>;
export type FormattedImportData = {
  note: Partial<Omit<Note, "fields">> & {
    fields: Record<string, string>;
  };
  media: LocalOrRemoteMedia[];
};
