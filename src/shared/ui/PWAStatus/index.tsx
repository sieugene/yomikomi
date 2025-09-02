"use client";

import React from "react";

import { usePWA } from "@/shared/contexts/PWAContext";
import {
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  useNetworkSync,
  useOfflineReady,
  usePWACache,
  usePWAInstall,
  usePWASupport,
} from "@/shared/hooks/usePWA";

interface PWAStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({
  className = "",
  showDetails = false,
}) => {
  const { isOffline, isServiceWorkerReady } = usePWA();
  const { canInstall, isInstalled, isInstalling, install } = usePWAInstall();
  const { cacheStatus, isCacheLoading, clearCache, refreshCacheStatus } =
    usePWACache();
  const { isOfflineReady, loadingProgress } = useOfflineReady();
  const { hasPendingSyncs } = useNetworkSync();
  const support = usePWASupport();

  return (
    <div className={`pwa-status ${className}`}>
      {/* Статус подключения */}
      <div className="flex items-center gap-2 mb-2">
        {isOffline ? (
          <div className="flex items-center gap-1 text-red-600">
            <WifiOff size={16} />
            <span className="text-sm">Офлайн</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi size={16} />
            <span className="text-sm">Онлайн</span>
          </div>
        )}

        {/* Статус готовности к офлайн работе */}
        {isOfflineReady ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={16} />
            <span className="text-sm">Готов к офлайн</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertCircle size={16} />
            <span className="text-sm">
              Загрузка ресурсов... {loadingProgress}%
            </span>
          </div>
        )}

        {/* Индикатор ожидающей синхронизации */}
        {hasPendingSyncs && (
          <div className="flex items-center gap-1 text-blue-600">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Ожидает синхронизации</span>
          </div>
        )}
      </div>

      {/* Кнопка установки */}
      {canInstall && (
        <button
          onClick={install}
          disabled={isInstalling}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 mb-2"
        >
          <Download size={16} />
          {isInstalling ? "Установка..." : "Установить приложение"}
        </button>
      )}

      {/* Детальная информация */}
      {showDetails && (
        <div className="text-xs text-gray-600 space-y-1">
          <div>Service Worker: {isServiceWorkerReady ? "✅" : "❌"}</div>
          <div>Установлено: {isInstalled ? "✅" : "❌"}</div>
          <div>Кэш: {cacheStatus?.cacheSize || 0} файлов</div>
          <div>Kuromoji: {cacheStatus?.kuromojiCached ? "✅" : "❌"}</div>

          {/* Поддержка браузера */}
          <div className="mt-2">
            <div>Поддержка:</div>
            <div className="pl-2">
              <div>SW: {support.serviceWorker ? "✅" : "❌"}</div>
              <div>IndexedDB: {support.indexedDB ? "✅" : "❌"}</div>
              <div>WASM: {support.webAssembly ? "✅" : "❌"}</div>
              <div>Notifications: {support.notification ? "✅" : "❌"}</div>
            </div>
          </div>

          {/* Действия с кэшем */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={refreshCacheStatus}
              disabled={isCacheLoading}
              className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isCacheLoading ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={clearCache}
              disabled={isCacheLoading}
              className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Компактная версия статуса
export const PWAStatusBadge: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { isOffline } = usePWA();
  const { isOfflineReady } = useOfflineReady();

  if (isOffline && isOfflineReady) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs ${className}`}
      >
        <CheckCircle size={12} />
        <span>Офлайн готов</span>
      </div>
    );
  }

  if (isOffline && !isOfflineReady) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs ${className}`}
      >
        <WifiOff size={12} />
        <span>Ограниченный доступ</span>
      </div>
    );
  }

  return null;
};
