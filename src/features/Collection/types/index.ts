import { Media, Note } from "@/infrastructure/database/generated";

export type FormattedImportData = {
  note: Omit<Note, "fields"> & {
    fields: Record<string, string>;
  };
  media: Media[];
};
