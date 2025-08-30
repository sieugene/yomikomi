import { useDictionaryLookupStore } from "@/entities/DictionaryLookup/hooks/useDictionaryLookupStore";
import { InteractiveSentence } from "@/entities/DictionaryLookup/ui/InteractiveSentence";
import { SearchResultsPanel } from "@/entities/DictionaryLookup/ui/SearchResultsPanel";
import { useStoreDictionarySearchSettings } from "@/features/dictionary-search/context/DictionarySearchSettingsContext";
import type { TextBlock as TextBlockT } from "@/features/ocr/types";
import useClickOutside from "@/shared/hooks/useClickOutside";
import { FC, useMemo, useRef } from "react";

type Props = {
  textBlock: TextBlockT;
  showBoundingBoxes: boolean;
  showDictionary: boolean;
  isSelected: boolean;
  onTextClick: (textBlock: TextBlockT) => void;
  displayDimensions: {
    width: number;
    height: number;
  };
  originalDimensions: {
    width: number;
    height: number;
  };
  fontTransparency: number;
  textScale: number;
};
export const TextBlock: FC<Props> = ({
  textBlock,
  displayDimensions,
  originalDimensions,
  onTextClick,
  isSelected,
  fontTransparency,
  showBoundingBoxes,
  textScale,
  showDictionary,
}) => {
  const coords = useMemo(() => {
    if (
      displayDimensions.width === 0 ||
      displayDimensions.height === 0 ||
      originalDimensions.width === 0 ||
      originalDimensions.height === 0
    ) {
      return null;
    }

    const scaleX = displayDimensions.width / originalDimensions.width;
    const scaleY = displayDimensions.height / originalDimensions.height;

    return {
      x: textBlock.bbox.x_min * scaleX,
      y: textBlock.bbox.y_min * scaleY,
      width: textBlock.bbox.width * scaleX,
      height: textBlock.bbox.height * scaleY,
    };
  }, [displayDimensions, originalDimensions, textBlock]);

  const { deepSearchMode } = useStoreDictionarySearchSettings();
  const {
    clear,
    loading,
    handleWordClick,
    selectedWordId,
    groupedResults,
    selectedToken,
    error,
    panelOpen,
    searchStats,
  } = useDictionaryLookupStore();
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, () => {
    clear();
  });

  if (!coords) return null;

  return (
    <div>
      <div
        className={`absolute cursor-pointer transition-all duration-200 ${
          showBoundingBoxes
            ? isSelected
              ? "bg-blue-500/30 border-2 border-blue-500"
              : "bg-green-500/20 border border-green-500 hover:bg-green-500/50"
            : "bg-transparent"
        }`}
        style={{
          left: coords.x,
          top: coords.y,
          width: coords.width,
          height: coords.height,
        }}
        onClick={() => onTextClick(textBlock)}
        title={`Text: ${textBlock.text}\nConfidence: ${(
          textBlock.confidence * 100
        ).toFixed(1)}%`}
      >
        {isSelected && (
          <>
            {showDictionary && (
              <div className="compact_dictionary_lookup absolute top-0 z-10 p-1.5">
                <InteractiveSentence
                  sentence={textBlock.text}
                  onWordClick={handleWordClick}
                  selectedWordId={selectedWordId}
                  className="mb-4"
                />

                <SearchResultsPanel
                  results={groupedResults}
                  selectedToken={selectedToken}
                  loading={loading}
                  error={error}
                  searchStats={searchStats}
                  deepSearchMode={deepSearchMode}
                  isOpen={panelOpen}
                  onClose={() => {
                    clear();
                  }}
                  baseBottom={0}
                  ref={panelRef}
                />
              </div>
            )}
            <div
              className="text-xs font-semibold text-gray-800"
              style={{
                fontSize: Math.min(coords.height / 3, 12) * textScale,
                opacity: fontTransparency,
              }}
            >
              {textBlock.text}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
