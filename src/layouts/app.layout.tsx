"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { Header } from "@/shared/ui/Header";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApplicationContext>
      <Header />
      <div className="min-h-[calc(100vh-4rem)]">{children}</div>
    </ApplicationContext>
  );
};
