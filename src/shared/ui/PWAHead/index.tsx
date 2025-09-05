"use client";

import { useEffect } from "react";

export const PWAHead: React.FC = () => {
  useEffect(() => {
    // Динамически добавляем meta теги которые не поддерживаются в Next.js metadata API
    const addMetaTag = (name: string, content: string) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute("content", content);
      } else {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    const addLinkTag = (
      rel: string,
      href: string,
      sizes?: string,
      type?: string
    ) => {
      const existingTag = document.querySelector(
        `link[rel="${rel}"][href="${href}"]`
      );
      if (!existingTag) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        if (sizes) link.setAttribute("sizes", sizes);
        if (type) link.type = type;
        document.head.appendChild(link);
      }
    };

    // PWA meta теги
    addMetaTag("mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "default");
    addMetaTag("apple-mobile-web-app-title", "Yomikomi");
    addMetaTag("application-name", "Yomikomi");
    addMetaTag("msapplication-TileColor", "#000000");
    addMetaTag("msapplication-tap-highlight", "no");

    // Иконки для разных устройств
    addLinkTag("icon", "/icons/icon-192x192.png", "192x192", "image/png");
    addLinkTag("icon", "/icons/icon-512x512.png", "512x512", "image/png");
    addLinkTag("apple-touch-icon", "/icons/icon-192x192.png");
    addLinkTag("mask-icon", "/icons/icon-192x192.png");

    // Preload критически важных ресурсов
    addLinkTag(
      "preload",
      "/kuromoji/base.dat.gz",
      undefined,
      "application/gzip"
    );
    addLinkTag(
      "preload",
      "/kuromoji/check.dat.gz",
      undefined,
      "application/gzip"
    );

    // DNS prefetch для внешних ресурсов (если используются)
    // addLinkTag('dns-prefetch', '//fonts.googleapis.com');
  }, []);

  return null; // Этот компонент не рендерит ничего видимого
};
