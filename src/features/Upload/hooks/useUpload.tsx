"use client";
import type { ImportRouteResponse } from "@/app/api/import/route";
import { Media, Note } from "@/infrastructure/database/generated";
import { API_ENDPOINTS } from "@/shared/api";
import { NotesResponse } from "@/shared/api/types";
import { useEffect, useState } from "react";

export const useUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(API_ENDPOINTS.import, {
      method: "POST",
      body: form,
    });
    const json = (await res.json()) as ImportRouteResponse;
    console.log(json);
  };
  return { setFile, handleUpload };
};

export type FormattedImportData = {
  note: Omit<Note, "fields"> & {
    fields: Record<string, string>;
  };
  media: Media[];
};

export const useNotes = () => {
  const [data, setData] = useState<FormattedImportData[]>([]);
  const handleFetch = async () => {
    const response = await fetch(API_ENDPOINTS.notes);
    const json = (await response.json()) as NotesResponse;
    const formatted = json.notes.map((note) => {
      const fields = JSON.parse(note.fields?.toString() || "");
      const importData: FormattedImportData = {
        note: {
          ...note,
          fields: fields,
        },
        media: json.media,
      };
      return importData;
    });
    setData(formatted);
  };
  useEffect(() => {
    handleFetch();
  }, []);
  return { data };
};
