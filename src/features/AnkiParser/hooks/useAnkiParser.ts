"use client";
import JSZip from "jszip";
import { useSqlJs } from "../context/SqlJsProvider";
import { useState } from "react";
import { FormattedImportData } from "@/features/Collection/types";
import { Deck } from "../model/Deck";

export const useAnkiParser = () => {
  const [data, setData] = useState<FormattedImportData[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const { sqlClient } = useSqlJs();

  const handleUpload = async () => {
    if (!file) {
      throw new Error("No file selected");
    }
    if (!sqlClient) {
      throw new Error("SQL client is not initialized");
    }
    const deck = new Deck(sqlClient, file);
    await deck.init();

    const mediaMap = await deck.getMedia();

    const notesRaw = await deck.getNotes();
    const models = await deck.getModels();

    const notes = Object.values(notesRaw).map((note) => {
      const model = models[note.mid];

      const fieldNames: string[] = model.flds.map((f: any) => f.name);
      const values = note.flds.split("\x1f");
      const fields: Record<string, string> = {};
      fieldNames.forEach((name, idx) => {
        fields[name] = values[idx] ?? "";
      });
      return {
        id: note.id,
        fields,
      };
    });
    const formatted = notes.map((note) => {
      const collectionId = "0";
      const createdAt = new Date();
      const updatedAt = new Date();

      const importData: FormattedImportData = {
        note: {
          ...note,
          collectionId,
          createdAt,
          updatedAt,
        },
        media: Object.values(mediaMap).map((media, index) => {
          const item: FormattedImportData["media"][0] = {
            id: index.toString(),
            collectionId,
            createdAt,
            updatedAt,
            originalName: media,
            path: media,
            type: "image",
          };
          return item;
        }),
      };
      return importData;
    });
    setData(formatted);
  };
  return { handleUpload, setFile, data };
};
