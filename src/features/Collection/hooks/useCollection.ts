import { ApiClient } from "@/shared/api/api.client";
import { useEffect, useState } from "react";
import { FormattedImportData } from "../types";
import { ApiResponse } from "@/infrastructure/api/types";

export const useAllCollections = () => {
  const [data, setData] = useState<ApiResponse["Collection"]["All"]>([]);
  const handleFetch = async () => {
    const response = await ApiClient.getAllCollections();
    setData(response);
  };
  useEffect(() => {
    handleFetch();
  }, []);
  return data;
};

export const useCollectionById = (collectionId: string) => {
  const [data, setData] = useState<FormattedImportData[]>([]);
  const handleFetch = async (id: string) => {
    if (!id) return;
    const response = await ApiClient.getCollectionById(id);
    const formatted = response.notes.map((note) => {
      const fields = JSON.parse(note.fields?.toString() || "");
      const importData: FormattedImportData = {
        note: {
          ...note,
          fields: fields,
        },
        media: response.media,
      };
      return importData;
    });
    setData(formatted);
  };
  useEffect(() => {
    handleFetch(collectionId);
  }, [collectionId]);
  return { data };
};
