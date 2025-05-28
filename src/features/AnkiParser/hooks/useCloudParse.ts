import { useStoreCollection } from "@/features/Collection/context/StoreCollectionContext";
import { MegaCloudExtractor } from "../model/extractors/MegaCloudExtractor";
import { useAnkiParser } from "./useAnkiParser";
import { FAST_MEMORY_CLOUD_FILE_NAME } from "../lib/constants";

export const useCloudParse = () => {
  const { getStoreManager } = useStoreCollection();
  const { data, handleUpload } = useAnkiParser("cloud");

  const upload = async (url: string) => {
    if (!url) {
      throw new Error("Url is required");
    }
    const file = new File(
      [JSON.stringify({ url })],
      FAST_MEMORY_CLOUD_FILE_NAME,
      {
        type: "application/json",
      }
    );

    const extractor = new MegaCloudExtractor(url);
    await extractor.init();
    await handleUpload(extractor, file);
  };

  const getCacheFile = async (id: string) => {
    const fileStore = getStoreManager();
    const fileIsExist = await fileStore.has(id);
    if (fileIsExist) {
      const file = await fileStore.getAsFile(id);
      if (file) {
        const text = await file.text();
        const json = JSON.parse(text) as { url: string };
        const extractor = new MegaCloudExtractor(json.url);
        await extractor.init();
        await handleUpload(extractor);
      }
    } else {
      throw new Error("Cannot find file");
    }
  };

  return { data, upload, getCacheFile };
};
