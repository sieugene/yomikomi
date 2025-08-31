import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

export const useSpeechSynthesis = (options: SpeechOptions = {}) => {
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  // Get the best voice for the language
  const getBestVoice = useCallback((lang: string = 'en-US') => {
    if (voices.length === 0) return null;

    // Try to find a voice that matches the language
    const exactMatch = voices.find(voice => 
      voice.lang.toLowerCase() === lang.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Try to find a voice that matches the language code (e.g., 'en' for 'en-US')
    const langCode = lang.split('-')[0];
    const partialMatch = voices.find(voice => 
      voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // Return the default voice
    return voices.find(voice => voice.default) || voices[0];
  }, [voices]);

  const speak = useCallback((text: string, customOptions?: SpeechOptions) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const mergedOptions = { ...options, ...customOptions };
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    const voice = mergedOptions.voice || getBestVoice(mergedOptions.lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else if (mergedOptions.lang) {
      utterance.lang = mergedOptions.lang;
    }

    // Set speech parameters
    if (mergedOptions.rate !== undefined) utterance.rate = mergedOptions.rate;
    if (mergedOptions.pitch !== undefined) utterance.pitch = mergedOptions.pitch;
    if (mergedOptions.volume !== undefined) utterance.volume = mergedOptions.volume;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      utteranceRef.current = null;
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  }, [isSupported, options, getBestVoice]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    speechSynthesis.pause();
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    speechSynthesis.resume();
  }, [isSupported, isSpeaking]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    utteranceRef.current = null;
  }, [isSupported]);

  // Auto-detect language from text (basic implementation)
  const detectLanguage = useCallback((text: string): string => {
    // Simple language detection based on character patterns
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    const hasChinese = /[\u4E00-\u9FAF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text);
    const hasKorean = /[\uAC00-\uD7AF]/.test(text);
    const hasRussian = /[\u0400-\u04FF]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    
    if (hasJapanese) return 'ja-JP';
    if (hasChinese) return 'zh-CN';
    if (hasKorean) return 'ko-KR';
    if (hasRussian) return 'ru-RU';
    if (hasArabic) return 'ar-SA';
    
    return 'en-US'; // Default to English
  }, []);

  const speakWithAutoDetect = useCallback((text: string, customOptions?: SpeechOptions) => {
    const detectedLang = detectLanguage(text);
    speak(text, { ...customOptions, lang: detectedLang });
  }, [speak, detectLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    currentUtterance,
    speak,
    speakWithAutoDetect,
    pause,
    resume,
    stop,
    getBestVoice,
    detectLanguage,
  };
};