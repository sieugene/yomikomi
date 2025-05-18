import { ApiResponse } from "@/infrastructure/api/types";
import { prisma } from "@/infrastructure/database/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getByCollectionId(
  _: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
): Promise<
  NextResponse<ApiResponse["Collection"]["ById"] | { error: string }>
> {
  const params = await context.params;
  const collectionId = params.collectionId;
  if (!collectionId) {
    return NextResponse.json({ error: "Collection ID is required" });
  }

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        notes: true,
        media: true,
      },
    });
    if (!collection) {
      return NextResponse.json({ error: "not find collection by id" });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

async function getAll(
  req: NextRequest
): Promise<NextResponse<ApiResponse["Collection"]["All"] | { error: string }>> {
  try {
    const collections = await prisma.collection.findMany();

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export const API_COLLECTION_HANDLERS = {
  GET_BY_COLLECTION_ID: getByCollectionId,
  GET_ALL: getAll,
};
