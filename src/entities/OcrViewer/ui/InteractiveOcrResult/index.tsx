import { Dispatch, SetStateAction, useMemo } from "react";
import { ImageWithTextOverlays } from "../ImageWithTextOverlays";

import { OCRResponse } from "@/features/ocr/types";
import { useInteractiveOcr } from "../../hooks/useInteractiveOcr";

type Props = {
  imageUrl: string;
  setCopyFeedback: Dispatch<SetStateAction<string | null>>;
  result: OCRResponse;
};
export const InteractiveOcrResult: React.FC<Props> = ({
  imageUrl,
  result,
  setCopyFeedback,
}) => {
  const { handleTextBlockClick, selectedTextBlock } = useInteractiveOcr();

  const selectedTextId = useMemo(
    () => selectedTextBlock?.id,
    [selectedTextBlock]
  );

  return (
    <div className="interactive-ocr-result">
      <ImageWithTextOverlays
        selectedTextId={selectedTextId}
        imageUrl={imageUrl}
        textBlocks={result.text_blocks}
        onTextClick={handleTextBlockClick}
        className="w-full"
        imageInfo={result.image_info}
      />
      {/* <div className="bg-white rounded-lg shadow-sm">
        {selectedTextBlock && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">
              Selected Text Block:
            </div>
            <div className="text-blue-800 font-medium">
              {selectedTextBlock.text}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Confidence: {(selectedTextBlock.confidence * 100).toFixed(1)}%
            </div>
            <DictionaryLookup
              sentence={selectedTextBlock.text}
              baseBottom={0}
            />
          </div>
        )}
      </div> */}
    </div>
  );
};
