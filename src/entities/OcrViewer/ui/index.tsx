// src/entities/OcrViewer/ui/index.tsx
import { FC, useEffect, useState } from "react";
import { InteractiveOcrResult } from "./InteractiveOcrResult";
import { GestureHints } from "./GestureHints";
import { FloatingActions } from "./FloatingActions";
import { OCRAlbumImage } from "@/features/ocr-album/types";
import { CopyFeedback } from "./CopyFeedback";
import { OcrFailure } from "./OcrFailure";
import { useFirstVisit } from "../hooks/useFirstVisit";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useDownloadText } from "../hooks/useDownloadText";
import { useOcrCopy } from "../hooks/useOcrCopy";
import { AlertTriangle, Image as ImageIcon, Loader2 } from "lucide-react";

type Props = Pick<OCRAlbumImage, "originalFile" | "ocrResult" | "error">;

export const OcrViewer: FC<Props> = ({ originalFile, ocrResult, error }) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(!!originalFile);
  const [selectedTextBlock, setSelectedTextBlock] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Hooks
  const { 
    shouldShowHints, 
    markHintsAsShown,
    showHintsManually 
  } = useFirstVisit();
  
  const { 
    speak, 
    speakWithAutoDetect,
    isSpeaking, 
    stop: stopSpeech 
  } = useSpeechSynthesis();
  
  const { handleDownloadText } = useDownloadText();
  const { handleCopyFullText } = useOcrCopy(setCopyFeedback);

  // Handle image URL creation and cleanup
  useEffect(() => {
    if (!originalFile) {
      setImageUrl(null);
      setIsImageLoading(false);
      return;
    }

    setIsImageLoading(true);
    
    // Small delay to show loading state
    const timer = setTimeout(() => {
      const url = URL.createObjectURL(originalFile);
      setImageUrl(url);
      setIsImageLoading(false);
    }, 300);

    // Cleanup: revoke the object URL when the component unmounts or the file changes
    return () => {
      clearTimeout(timer);
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [originalFile]);

  // Speech handlers
  const handleSpeak = () => {
    if (!ocrResult?.full_text) return;
    
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakWithAutoDetect(ocrResult.full_text);
    }
  };

  const handleSpeakSelected = () => {
    if (!selectedTextBlock?.text) return;
    
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakWithAutoDetect(selectedTextBlock.text);
    }
  };

  // Action handlers
  const handleCopyAll = () => {
    if (ocrResult) {
      handleCopyFullText(ocrResult);
    }
  };

  const handleDownload = () => {
    if (ocrResult) {
      handleDownloadText(ocrResult);
    }
  };

  const handleShowDictionary = () => {
    // This would integrate with your dictionary component
    console.log("Show dictionary for:", selectedTextBlock?.text);
  };

  // Show loading state
  if (isImageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <ImageIcon className="w-12 h-12 text-gray-300" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Loading image...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we prepare your image</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full">
        <OcrFailure error={error} />
        
        {/* Show image even if OCR failed */}
        {imageUrl && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">OCR Processing Failed</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The image is displayed below, but text extraction was unsuccessful.
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <img
                src={imageUrl}
                alt="Original image (OCR failed)"
                className="w-full h-auto max-w-full border rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show no data state
  if (!originalFile && !ocrResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Image Selected</h3>
          <p className="text-gray-600">
            Upload an image to start OCR text extraction
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 relative">
      {/* Copy Feedback */}
      {copyFeedback && <CopyFeedback message={copyFeedback} />}

      {/* Main OCR Results */}
      {ocrResult && imageUrl ? (
        <InteractiveOcrResult
          imageUrl={imageUrl}
          result={ocrResult}
          setCopyFeedback={setCopyFeedback}
        />
      ) : imageUrl ? (
        // Show image without OCR results (pending processing)
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">Processing Image</p>
                <p className="text-sm text-blue-700">OCR analysis in progress...</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src={imageUrl}
              alt="Image being processed"
              className="w-full h-auto max-w-full border rounded-lg shadow-sm opacity-75"
            />
            <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Analyzing text...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Mobile Floating Actions */}
      {ocrResult && (
        <FloatingActions
          onCopyAll={handleCopyAll}
          onDownload={handleDownload}
          onSpeak={selectedTextBlock?.text ? handleSpeakSelected : handleSpeak}
          onShowDictionary={handleShowDictionary}
          onShowHelp={showHintsManually}
          onShowSettings={() => setShowSettings(true)}
          isSpeaking={isSpeaking}
          hasSelectedText={!!selectedTextBlock?.text}
        />
      )}
      
      {/* Gesture Hints */}
      <GestureHints
        isFirstVisit={shouldShowHints}
        onClose={markHintsAsShown}
      />
      
      {/* Mobile Usage Tips */}
      <div className="sm:hidden mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
        <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Mobile Tips
        </h4>
        <ul className="text-xs text-indigo-800 space-y-1.5 leading-relaxed">
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">👆</span>
            <span>Tap any highlighted text to select it</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">🎯</span>
            <span>Long press for context menu with actions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">📖</span>
            <span>Double tap for quick dictionary lookup</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">🔊</span>
            <span>Use floating action button to hear text read aloud</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">⚙️</span>
            <span>Adjust text size and visibility in settings panel</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
