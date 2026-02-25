import { AppLayout } from "@/layouts/app.layout";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";
import { PAGE_METADA } from "@/shared/metadata/page.metadata";
import { APP_LANG, LangParams } from "@/shared/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams(): Promise<LangParams[]> {
  return [{ lang: "en" }, { lang: "ja" }];
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return PAGE_METADA[lang as APP_LANG] ?? PAGE_METADA.en;
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  return (
    <html lang={(await params).lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
