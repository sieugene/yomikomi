"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface PWAContextType {
  isOffline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  isServiceWorkerReady: boolean;
  cacheStatus: CacheStatus | null;
  install: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheStatus: () => Promise<void>;
  precacheResource: (url: string) => Promise<void>;
}

interface CacheStatus {
  cacheSize: number;
  kuromojiCached: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Инициализация Service Worker
  useEffect(() => {
    const initServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          setServiceWorkerRegistration(registration);

          console.log("[PWA] Service Worker registered successfully");

          // Проверяем готовность SW
          if (registration.active) {
            setIsServiceWorkerReady(true);
          }

          // Слушаем изменения состояния SW
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  setIsServiceWorkerReady(true);
                  window.location.reload();
                }
              });
            }
          });
        } catch (error) {
          console.error("[PWA] Service Worker registration failed:", error);
        }
      }
    };

    initServiceWorker();
  }, []);

  // Отслеживание сетевого статуса
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Отслеживание события установки PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Проверяем, запущено ли приложение в standalone режиме
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Функция установки PWA
  const install = useCallback(async () => {
    if (!deferredPrompt) {
      throw new Error("Installation prompt is not available");
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("[PWA] Installation failed:", error);
      throw error;
    }
  }, [deferredPrompt]);

  // Функция отправки сообщения в Service Worker
  const sendMessageToSW = useCallback(
    (type: string, payload?: unknown) => {
      return new Promise((resolve, reject) => {
        if (!serviceWorkerRegistration?.active) {
          reject(new Error("Service Worker not ready"));
          return;
        }

        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          const { success, data, error } = event.data;
          if (success) {
            resolve(data);
          } else {
            reject(new Error(error));
          }
        };

        serviceWorkerRegistration.active.postMessage({ type, payload }, [
          messageChannel.port2,
        ]);
      });
    },
    [serviceWorkerRegistration]
  );

  // Получение статуса кэша
  const getCacheStatus = useCallback(async () => {
    try {
      const status = await sendMessageToSW("GET_CACHE_STATUS");
      setCacheStatus(status as CacheStatus);
    } catch (error) {
      console.error("[PWA] Failed to get cache status:", error);
    }
  }, [sendMessageToSW]);

  // Очистка кэша
  const clearCache = useCallback(async () => {
    try {
      await sendMessageToSW("CLEAR_CACHE");
      setCacheStatus(null);
      console.log("[PWA] Cache cleared successfully");
    } catch (error) {
      console.error("[PWA] Failed to clear cache:", error);
      throw error;
    }
  }, [sendMessageToSW]);

  // Предварительное кэширование ресурса
  const precacheResource = useCallback(
    async (url: string) => {
      try {
        await sendMessageToSW("PRECACHE_RESOURCE", { url });
        console.log(`[PWA] Resource cached: ${url}`);
      } catch (error) {
        console.error(`[PWA] Failed to cache resource ${url}:`, error);
        throw error;
      }
    },
    [sendMessageToSW]
  );

  // Загружаем статус кэша при готовности SW
  useEffect(() => {
    if (isServiceWorkerReady) {
      getCacheStatus();
    }
  }, [isServiceWorkerReady, getCacheStatus]);

  const contextValue: PWAContextType = {
    isOffline,
    isInstalled,
    isInstallable,
    isServiceWorkerReady,
    cacheStatus,
    install,
    clearCache,
    getCacheStatus,
    precacheResource,
  };

  return (
    <PWAContext.Provider value={contextValue}>{children}</PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
};
