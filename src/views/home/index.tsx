"use client";
import { Parser } from "@/features/AnkiParser/ui";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <h1 className="mt-12 text-4xl font-extrabold text-indigo-900 mb-8">
        Anki Import Tool
      </h1>
      <Parser />
    </div>
  );
};
