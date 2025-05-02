"use client";
import { ApiClient } from "@/shared/api/api.client";
import { useState } from "react";

export const useUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const handleUpload = async () => {
    const response = await ApiClient.upload({ file, collectionName: "test" });
    console.log(response);
  };
  return { setFile, handleUpload };
};
