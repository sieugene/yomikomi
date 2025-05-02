import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, GetMediaQueryParams } from "../types";
import { GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { ENV } from "@/shared/env";
import { StorageService } from "@/infrastructure/storage/storage";

async function GET(
  req: NextRequest,
  context: { params: Promise<GetMediaQueryParams> }
): Promise<NextResponse<ApiResponse["Media"]>> {
  const params = await context.params;
  const fileName = params.filename;

  try {
    const command = new GetObjectCommand({
      Bucket: ENV.get("STORAGE_S3_BUCKET"),
      Key: fileName,
    });

    const { Body, ContentType }: GetObjectCommandOutput =
      await StorageService.client.send(command);

    if (!Body) {
      return new NextResponse("No content", { status: 404 });
    }

    return new NextResponse(Body as any, {
      headers: {
        "Content-Type": ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (err) {
    console.error("Error fetching from S3:", err);
    return new NextResponse("File not found", { status: 404 });
  }
}

export const API_MEDIA_HANDLERS = {
  GET,
};
