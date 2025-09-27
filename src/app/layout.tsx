import { AppLayout } from "@/layouts/app.layout";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yomimoki - Japanese Learning Tool",
  description: "Privacy-first Japanese learning app with OCR text recognition, JMdict dictionary lookup, and Anki deck import. Everything runs offline in your browser.",
  keywords: [
    "Yomikomi",
    "Yomimoki",
    "Japanese learning",
    "OCR text recognition",
    "JMdict dictionary",
    "Anki deck import",
    "Offline language tool",
    "Study Japanese",
    "Language learning app",
    "Japanese vocabulary",
    "Kanji study",
    "Flashcards",
    "Reading practice",
    "Language immersion",
    "Japanese grammar",
    "Language tools",
    "Study aid",
    "Educational app",
    "Language acquisition",
    "Japanese resources",
    "Japanese reading tool",
    "Offline japanese ocr",
    "Japanese manga reader",
    "Japanese article reader",
    "Japanese text scanner",
    "Japanese dictionary app",
    "Japanese flashcard app",
    "Anki flashcards",
    "Language learning resources",
    "Japanese study companion",
    "Learn Japanese offline",
    "Japanese language practice",
    "Japanese text recognition",
  ],
  authors: [{ name: "sieugene", url: "https://github.com/sieugene" }],
  creator: "sieugene",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
