"use client";
import TranslatorPage from '@/views/translator';
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranslatorPage />
    </Suspense>
  );
}
