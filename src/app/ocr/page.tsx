"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { OCRPage } from "@/views/ocr";

export default function Page() {
  return (
    <ApplicationContext>
      <OCRPage />
    </ApplicationContext>
  );
}
