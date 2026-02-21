"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";

export const AppContextLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApplicationContext>
      <>{children}</>
    </ApplicationContext>
  );
};
