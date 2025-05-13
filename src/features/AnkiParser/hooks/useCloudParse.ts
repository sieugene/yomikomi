import { useState } from "react";
import { MegaCloudExtractor } from "../model/extractors/MegaCloudExtractor";
import { useAnkiParser } from "./useAnkiParser";

export const useCloudParse = () => {
  const { data, handleUpload } = useAnkiParser();
  const [url, setUrl] = useState<string>("");

  const upload = async () => {
    if (!url) {
      throw new Error("Url is required");
    }
    const extractor = new MegaCloudExtractor(url);
    await extractor.init();
    await handleUpload(extractor);
  };

  return { setUrl, url, data, upload };
};
