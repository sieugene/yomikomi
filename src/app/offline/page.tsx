"use client";

import React from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { usePWA } from "@/shared/contexts/PWAContext";
import { useOfflineReady } from "@/shared/hooks/usePWA";

const OfflinePage: React.FC = () => {
  const { isOffline } = usePWA();
  const { isOfflineReady } = useOfflineReady();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <WifiOff size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Нет подключения к интернету
          </h1>
          <p className="text-gray-600">
            {isOfflineReady
              ? "Но вы можете продолжить использовать приложение в офлайн режиме!"
              : "Некоторые функции могут быть недоступны без подключения к интернету."}
          </p>
        </div>

        {/* Статус офлайн готовности */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            isOfflineReady
              ? "bg-green-50 border border-green-200"
              : "bg-orange-50 border border-orange-200"
          }`}
        >
          <h3
            className={`font-semibold mb-2 ${
              isOfflineReady ? "text-green-800" : "text-orange-800"
            }`}
          >
            Офлайн режим
          </h3>
          <p
            className={`text-sm ${
              isOfflineReady ? "text-green-700" : "text-orange-700"
            }`}
          >
            {isOfflineReady
              ? "✅ Все необходимые файлы загружены. Приложение полностью функционально офлайн."
              : "⚠️ Не все ресурсы загружены. Подключитесь к интернету для полной загрузки."}
          </p>
        </div>

        {/* Доступные функции офлайн */}
        {isOfflineReady && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">
              Доступно офлайн:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Токенизация текста (Kuromoji)</li>
              <li>• Поиск в словаре</li>
              <li>• Анализ грамматики</li>
              <li>• Сохранение данных локально</li>
              <li>• Работа с базами данных</li>
            </ul>
          </div>
        )}

        {/* Действия */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={20} />
            Попробовать еще раз
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home size={20} />
            На главную
          </button>
        </div>

        {/* Информация о подключении */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Статус: {isOffline ? "Офлайн" : "Онлайн"} | SW:{" "}
            {typeof window !== "undefined" && "serviceWorker" in navigator
              ? "Поддерживается"
              : "Не поддерживается"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
