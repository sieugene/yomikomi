import { FileStoreManager } from "@/features/StoreManager/model/FileStoreManager";
import { JSZipExtractor } from "../model/extractors/JSZipExtractor";
import { useAnkiParser } from "./useAnkiParser";

const CACHE_CARD = "anki-deck-test";
const FILE_STORE = new FileStoreManager();

export const useOfflineParse = () => {
  const { data, handleUpload } = useAnkiParser("offline");

  const upload = async (file: File | null) => {
    if (!file) {
      throw new Error("File is not selected");
    }
    await FILE_STORE.saveFile(file, "anki-deck-test");

    const extractor = new JSZipExtractor(file);
    await extractor.init();
    await handleUpload(extractor);
  };

  const getLastCacheFile = async () => {
    const fileIsExist = await FILE_STORE.has(CACHE_CARD);
    if (fileIsExist) {
      const file = await FILE_STORE.getAsFile(CACHE_CARD);
      if (file) {
        const extractor = new JSZipExtractor(file);
        await extractor.init();
        await handleUpload(extractor);
      }
      throw new Error("Cannot find file");
    } else {
      throw new Error("Cannot find file");
    }
  };

  return { data, upload, getLastCacheFile };
};
