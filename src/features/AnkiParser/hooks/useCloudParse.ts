import { MegaCloudExtractor } from "../model/extractors/MegaCloudExtractor";
import { useAnkiParser } from "./useAnkiParser";

export const useCloudParse = () => {
  const { data, handleUpload } = useAnkiParser("cloud");

  const upload = async (url: string) => {
    if (!url) {
      throw new Error("Url is required");
    }
    const extractor = new MegaCloudExtractor(url);
    await extractor.init();
    await handleUpload(extractor);
  };

  return { data, upload };
};
