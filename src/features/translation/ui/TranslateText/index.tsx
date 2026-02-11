import { Languages, Loader2 } from "lucide-react";
import { FC, useState } from "react";
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  selectedText: string;
}

export const TranslateText: FC<Props> = ({ selectedText }) => {
  const { translate, loading: isTranslating } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!selectedText.trim()) return;

    setError(null);

    try {
      const result = await translate(selectedText);
      setTranslatedText(result);
    } catch (err) {
      console.error("Translation error:", err);
      setError(err instanceof Error ? err.message : "Translation failed");
    }
  };

  const handleClear = () => {
    setTranslatedText(null);
    setError(null);
  };

  return (
    <div className='pt-2'>
      <div className="flex items-center mb-2">

        {!translatedText && !isTranslating && (
          <button
            onClick={handleTranslate}
            disabled={!selectedText.trim() || isTranslating}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
            Translate
          </button>
        )}

        {translatedText && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        )}
      </div>

      {isTranslating && (
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-600">Translating...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-700">{error}</p>
        </div>
      )}

      {translatedText && !isTranslating && (
        <div className="p-3 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-sm text-gray-800 leading-relaxed">
            {translatedText}
          </p>
        </div>
      )}
    </div>
  );
};
