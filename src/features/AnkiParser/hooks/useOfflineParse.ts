import { useState } from "react";
import { useAnkiParser } from "./useAnkiParser";
import { JSZipExtractor } from "../model/extractors/JSZipExtractor";

export const useOfflineParse = () => {
  const { data, handleUpload } = useAnkiParser("offline");
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    if (!file) {
      throw new Error("File is not selected");
    }
    const extractor = new JSZipExtractor(file);
    await extractor.init();
    await handleUpload(extractor);
  };

  return { file, setFile, data, upload };
};
