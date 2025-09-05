import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWAProvider } from "@/shared/contexts/PWAContext";

import "./globals.css";
import { PWAHead } from "@/shared/ui/PWAHead";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yomikomi - Japanese Reading App",
  description: "Offline Japanese text analysis and dictionary app",
  keywords: [
    "japanese",
    "dictionary",
    "offline",
    "reading",
    "language learning",
  ],
  authors: [{ name: "Yomikomi Team" }],
  creator: "Yomikomi Team",
  publisher: "Yomikomi Team",
  applicationName: "Yomikomi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yomikomi",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Yomikomi",
    title: "Yomikomi - Japanese Reading App",
    description: "Offline Japanese text analysis and dictionary app",
  },
  twitter: {
    card: "summary",
    title: "Yomikomi - Japanese Reading App",
    description: "Offline Japanese text analysis and dictionary app",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#000000",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp">
      <head>
        <PWAHead />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  );
}
