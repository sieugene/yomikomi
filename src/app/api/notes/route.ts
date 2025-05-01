import { prisma } from "@/infrastructure/database/prisma";
import { NotesResponse } from "@/shared/api/types";
import { NextResponse } from "next/server";

export async function GET(): Promise<
  NextResponse<NotesResponse | { error: string }>
> {
  try {
    const notes = await prisma.note.findMany();
    const media = await prisma.media.findMany();

    return NextResponse.json({ notes, media });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
