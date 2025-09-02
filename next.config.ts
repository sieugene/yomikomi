import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Добавляем поддержку WASM
  webpack: (config, { isServer }) => {
    // Настройка для WASM файлов
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Настройка для работы с бинарными файлами
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Исключаем server-side рендеринг для некоторых модулей
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Добавляем headers для WASM и Cross-Origin
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      },
      {
        source: '/kuromoji/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*).wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default nextConfig;