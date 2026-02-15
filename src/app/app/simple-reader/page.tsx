"use client";
import { SimpleReaderPage } from "@/views/simple-reader";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SimpleReaderPage />
    </Suspense>
  );
}
