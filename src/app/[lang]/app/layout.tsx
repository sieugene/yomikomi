import { AppContextLayout } from "@/layouts/app-context.layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppContextLayout>{children}</AppContextLayout>
    </>
  );
}
