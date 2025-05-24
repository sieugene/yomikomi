import { JSZipExtractor } from "../model/extractors/JSZipExtractor";
import { useAnkiParser } from "./useAnkiParser";

export const useOfflineParse = () => {
  const { data, handleUpload } = useAnkiParser("offline");

  const upload = async (file: File | null) => {
    if (!file) {
      throw new Error("File is not selected");
    }
    const extractor = new JSZipExtractor(file);
    await extractor.init();
    await handleUpload(extractor);
  };

  return { data, upload };
};
