import { Note, Prisma } from "@/infrastructure/database/generated";
import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

// Main
export type ServiceStatus = "online" | "offline";
export type Services = "database" | "minio";

// Collection
export type CollectionWithNotesAndMedia = Prisma.CollectionGetPayload<{
  include: {
    notes: true;
    media: true;
  };
}>;

// Import
export type ImportRouteResponse = {
  createdNote: Note;
}[];
export type ImportRouteRequest = NextRequest & {
  formData(): Promise<FormData>;
};
export interface ImportFormData {
  file: File | null;
  collectionName: string | null;
}

// Media
export type GetMediaQueryParams = {
  filename: string;
};
export type GetMediaResponse = GetObjectCommandOutput["Body"];

export type ApiResponse = {
  Collection: {
    ById: CollectionWithNotesAndMedia;
    All: Prisma.CollectionGetPayload<{}>[];
  };
  Import: ImportRouteResponse;
  Media: GetMediaResponse;
  Health: {
    GET: HealthResponse;
  };
};

// Health
export type HealthResponse = {
  status: number;
  services: {
    database: ServiceStatus;
    minio: ServiceStatus;
  };
};
