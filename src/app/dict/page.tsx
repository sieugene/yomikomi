"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { DictPage } from "@/views/dict";

export default function Page() {
  return (
    <ApplicationContext>
      <DictPage />
    </ApplicationContext>
  );
}
