import { Metadata } from "next";
import { APP_LANG } from "./../types/index";
export const PAGE_METADA: { [key in APP_LANG]: Metadata } = {
  ja: {
    title: {
      default: "Yomikomi — 日本語学習ツール",
      template: "%s | Yomikomi",
    },
    description:
      "ブラウザで動く日本語学習ツール。OCR・辞書（JMdict）・翻訳・Ankiをエクステンションなしで使える。スマホ対応。",
    keywords: [
      "日本語学習",
      "OCR",
      "日本語辞書",
      "漢字",
      "manga OCR",
      "JMdict",
      "Anki",
      "Yomitan",
      "Japanese learner",
    ],
    metadataBase: new URL("https://github.com/sieugene/yomikomi"),

    openGraph: {
      title: "Yomikomi — 日本語学習ツール",
      description:
        "OCR・辞書・翻訳・AnkiがブラウザだけでOK。拡張機能不要、iPhoneでも動作。",
      url: "https://github.com/sieugene/yomikomi",
      siteName: "Yomikomi",
      locale: "ja_JP",
      alternateLocale: "en",
      type: "website",
    },

    alternates: {
      canonical: "https://yomikomi.vercel.app/en/app",
      languages: {
        en: "https://yomikomi.vercel.app/en/app",
        ja: "https://yomikomi.vercel.app/ja/app",
      },
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  },
  en: {
    title: {
      default: "Yomikomi — Japanese Reading Toolkit",
      template: "%s | Yomikomi",
    },
    description:
      "Browser-based toolkit for Japanese learners: OCR, dictionary (JMdict), translator, and Anki — no extensions, no servers, works on mobile.",
    keywords: [
      "Japanese OCR",
      "Japanese dictionary",
      "JMdict",
      "manga OCR",
      "Yomitan alternative",
      "Japanese learner tools",
      "Anki browser",
    ],
    authors: [
      { name: "sieugene", url: "https://github.com/sieugene/yomikomi" },
    ],
    creator: "sieugene",
    metadataBase: new URL("https://yomikomi.vercel.app/"),
    openGraph: {
      title: "Yomikomi — Japanese Learning Toolkit",
      description:
        "OCR, dictionary, translator and Anki in your browser. No extensions needed.",
      url: "https://yomikomi.vercel.app/",
      siteName: "Yomikomi",
      locale: "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: "https://yomikomi.vercel.app/ja/app",
    },
  },
};
