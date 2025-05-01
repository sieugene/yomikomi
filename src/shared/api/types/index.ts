import { Prisma } from "@/infrastructure/database/generated";

export type NotesResponse = {
  notes: Prisma.NoteGetPayload<{}>[];
  media: Prisma.MediaGetPayload<{}>[];
};
