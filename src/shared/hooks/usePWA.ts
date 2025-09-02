import { useState, useEffect, useCallback } from "react";
import { usePWA } from "../contexts/PWAContext";

// Hook для проверки готовности офлайн ресурсов
export const useOfflineReady = () => {
  const { isServiceWorkerReady, cacheStatus } = usePWA();
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (isServiceWorkerReady && cacheStatus) {
      const isReady = cacheStatus.kuromojiCached && cacheStatus.cacheSize > 0;
      setIsOfflineReady(isReady);
      setLoadingProgress(isReady ? 100 : 50);
    }
  }, [isServiceWorkerReady, cacheStatus]);

  return { isOfflineReady, loadingProgress };
};

// Hook для управления установкой PWA
export const usePWAInstall = () => {
  const { isInstallable, isInstalled, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  const handleInstall = useCallback(async () => {
    if (!isInstallable) return;

    setIsInstalling(true);
    setInstallError(null);

    try {
      await install();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Installation failed";
      setInstallError(errorMessage);
    } finally {
      setIsInstalling(false);
    }
  }, [isInstallable, install]);

  return {
    canInstall: isInstallable && !isInstalled,
    isInstalled,
    isInstalling,
    installError,
    install: handleInstall,
  };
};

// Hook для управления кэшированием
export const usePWACache = () => {
  const { cacheStatus, clearCache, getCacheStatus, precacheResource } =
    usePWA();
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [cacheError, setCacheError] = useState<string | null>(null);

  const handleClearCache = useCallback(async () => {
    setIsCacheLoading(true);
    setCacheError(null);

    try {
      await clearCache();
      await getCacheStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear cache";
      setCacheError(errorMessage);
    } finally {
      setIsCacheLoading(false);
    }
  }, [clearCache, getCacheStatus]);

  const handlePrecacheResource = useCallback(
    async (url: string) => {
      setIsCacheLoading(true);
      setCacheError(null);

      try {
        await precacheResource(url);
        await getCacheStatus();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to cache resource";
        setCacheError(errorMessage);
      } finally {
        setIsCacheLoading(false);
      }
    },
    [precacheResource, getCacheStatus]
  );

  const refreshCacheStatus = useCallback(async () => {
    setIsCacheLoading(true);
    setCacheError(null);

    try {
      await getCacheStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get cache status";
      setCacheError(errorMessage);
    } finally {
      setIsCacheLoading(false);
    }
  }, [getCacheStatus]);

  return {
    cacheStatus,
    isCacheLoading,
    cacheError,
    clearCache: handleClearCache,
    precacheResource: handlePrecacheResource,
    refreshCacheStatus,
  };
};

// Hook для отслеживания соединения и синхронизации
export const useNetworkSync = () => {
  const { isOffline } = usePWA();
  const [pendingSyncs, setPendingSyncs] = useState<string[]>([]);

  // Добавить задачу для синхронизации
  const addPendingSync = useCallback((syncId: string) => {
    setPendingSyncs((prev) => [...prev.filter((id) => id !== syncId), syncId]);
  }, []);

  // Удалить задачу синхронизации
  const removePendingSync = useCallback((syncId: string) => {
    setPendingSyncs((prev) => prev.filter((id) => id !== syncId));
  }, []);

  // Очистить все задачи синхронизации
  const clearPendingSyncs = useCallback(() => {
    setPendingSyncs([]);
  }, []);

  // Проверить есть ли задачи для синхронизации
  const hasPendingSyncs = pendingSyncs.length > 0;

  return {
    isOffline,
    pendingSyncs,
    hasPendingSyncs,
    addPendingSync,
    removePendingSync,
    clearPendingSyncs,
  };
};

// Hook для проверки поддержки PWA функций
export const usePWASupport = () => {
  const [support, setSupport] = useState({
    serviceWorker: false,
    notification: false,
    backgroundSync: false,
    indexedDB: false,
    webAssembly: false,
  });

  useEffect(() => {
    const checkSupport = () => {
      setSupport({
        serviceWorker: "serviceWorker" in navigator,
        notification: "Notification" in window,
        backgroundSync:
          "serviceWorker" in navigator &&
          "sync" in window.ServiceWorkerRegistration.prototype,
        indexedDB: "indexedDB" in window,
        webAssembly: "WebAssembly" in window,
      });
    };

    checkSupport();
  }, []);

  return support;
};

// Hook для работы с уведомлениями
export const usePWANotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported");
    }

    if (permission !== "default") {
      return permission;
    }

    setIsRequestingPermission(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } finally {
      setIsRequestingPermission(false);
    }
  }, [permission]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission === "granted") {
        return new Notification(title, options);
      }
      throw new Error("Notification permission not granted");
    },
    [permission]
  );

  return {
    permission,
    isRequestingPermission,
    canShowNotifications: permission === "granted",
    requestPermission,
    showNotification,
  };
};
