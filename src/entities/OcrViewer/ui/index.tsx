import { FC, useEffect, useState } from "react";

import { InteractiveOcrResult } from "@/entities/OcrViewer/ui/InteractiveOcrResult";
import { OCRAlbumImage } from "@/features/ocr-album/types";
import { CopyFeedback } from "./CopyFeedback";
import { OcrFailure } from "./OcrFailure";

type Props = Pick<OCRAlbumImage, "originalFile" | "ocrResult" | "error">;
export const OcrViewer: FC<Props> = ({ originalFile, ocrResult, error }) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!originalFile) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(originalFile);
    setImageUrl(url);

    // Cleanup: revoke the object URL when the component unmounts or the file changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [originalFile]);

  return (
    <>
      {copyFeedback && <CopyFeedback message={copyFeedback} />}

      {error && <OcrFailure error={error} />}

      {/* Results */}
      {ocrResult && imageUrl && (
        <InteractiveOcrResult
          imageUrl={imageUrl}
          result={ocrResult}
          setCopyFeedback={setCopyFeedback}
        />
      )}
    </>
  );
};
