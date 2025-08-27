import { FC, useEffect, useState } from "react";

import { InteractiveOcrResult } from "@/entities/OcrViewer/ui/InteractiveOcrResult";
import { OCRAlbumImage } from "@/features/ocr-album/types";
import { CopyFeedback } from "./CopyFeedback";
import { OcrFailure } from "./OcrFailure";

type Props = {
  data: OCRAlbumImage;
};
export const OcrViewer: FC<Props> = ({ data }) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data.originalFile) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(data.originalFile);
    setImageUrl(url);

    // Cleanup: revoke the object URL when the component unmounts or the file changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [data.originalFile]);

  return (
    <>
      {copyFeedback && <CopyFeedback message={copyFeedback} />}

      {data.error && <OcrFailure error={data.error} />}

      {/* Results */}
      {data.ocrResult && imageUrl && (
        <InteractiveOcrResult
          imageUrl={imageUrl}
          result={data.ocrResult}
          setCopyFeedback={setCopyFeedback}
        />
      )}
    </>
  );
};
