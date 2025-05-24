"use client";
import { ApiClient } from "@/shared/api/api.client";

export const useUpload = () => {
  const handleUpload = async (file: File | null) => {
    const response = await ApiClient.upload({ file, collectionName: "test" });
    console.log(response);
  };
  return { handleUpload };
};
