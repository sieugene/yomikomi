import { Media, Note } from "@/infrastructure/database/generated";

type LocalOrRemoteMedia = Media & {
  getBlob?: () => Promise<string>;
};
export type FormattedImportData = {
  note: Omit<Note, "fields"> & {
    fields: Record<string, string>;
  };
  media: LocalOrRemoteMedia[];
};
