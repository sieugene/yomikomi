import { useEffect, useState, useCallback } from "react";
import { useTokenizer } from "./useTokenizer";
import { usePWA } from "@/shared/contexts/PWAContext";
import { useOfflineReady } from "@/shared/hooks/usePWA";
import { DisplayToken } from './useDictTokenizer';

interface PWATokenizerHookReturn {
  tokenizeText: (text: string) => Promise<DisplayToken[]>;
  isReady: boolean;
  isOfflineReady: boolean;
  error: string | null;
  loadingStatus: {
    kuromoji: boolean;
    dictionary: boolean;
    serviceWorker: boolean;
  };
}

export const usePWATokenizer = (): PWATokenizerHookReturn => {
  const {
    isReady: tokenizerReady,
    error: tokenizerError,
    tokenizeText,
  } = useTokenizer();
  const { isServiceWorkerReady, precacheResource } = usePWA();
  const { isOfflineReady } = useOfflineReady();

  const [loadingStatus, setLoadingStatus] = useState({
    kuromoji: false,
    dictionary: false,
    serviceWorker: false,
  });

  const [error, setError] = useState<string | null>(null);

  // Обновляем статус загрузки
  useEffect(() => {
    setLoadingStatus((prev) => ({
      ...prev,
      kuromoji: tokenizerReady,
      serviceWorker: isServiceWorkerReady,
    }));
  }, [tokenizerReady, isServiceWorkerReady]);

  // Предварительное кэширование Kuromoji ресурсов при готовности SW
  useEffect(() => {
    const precacheKuromojiResources = async () => {
      if (!isServiceWorkerReady) return;

      const kuromojiFiles = [
        "/kuromoji/base.dat.gz",
        "/kuromoji/check.dat.gz",
        "/kuromoji/tid.dat.gz",
        "/kuromoji/tid_pos.dat.gz",
        "/kuromoji/tid_map.dat.gz",
        "/kuromoji/word_id.dat.gz",
        "/kuromoji/word_pos.dat.gz",
        "/kuromoji/unk.dat.gz",
        "/kuromoji/unk_pos.dat.gz",
        "/kuromoji/unk_map.dat.gz",
        "/kuromoji/unk_char.dat.gz",
        "/kuromoji/unk_compat.dat.gz",
        "/kuromoji/unk_invoke.dat.gz",
      ];

      try {
        for (const file of kuromojiFiles) {
          await precacheResource(file);
        }
        console.log("[PWA Tokenizer] All Kuromoji resources cached");
      } catch (error) {
        console.warn(
          "[PWA Tokenizer] Failed to precache some resources:",
          error
        );
      }
    };

    precacheKuromojiResources();
  }, [isServiceWorkerReady, precacheResource]);

  // Объединяем ошибки
  useEffect(() => {
    setError(tokenizerError);
  }, [tokenizerError]);

  // Wrapper для токенизации с обработкой офлайн режима
  const handleTokenizeText = useCallback(
    async (text: string) => {
      try {
        if (!tokenizerReady) {
          throw new Error("Tokenizer not ready");
        }

        return await tokenizeText(text);
      } catch (error) {
        console.error("[PWA Tokenizer] Tokenization failed:", error);

        // В офлайн режиме пытаемся дать более информативную ошибку
        if (!navigator.onLine) {
          throw new Error("Офлайн режим: токенизатор не полностью загружен");
        }

        throw error;
      }
    },
    [tokenizerReady, tokenizeText]
  );

  return {
    tokenizeText: handleTokenizeText,
    isReady: tokenizerReady && isServiceWorkerReady,
    isOfflineReady,
    error,
    loadingStatus,
  };
};
