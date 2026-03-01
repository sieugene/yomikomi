import { AlbumList } from "@/features/ocr-album/ui/AlbumList";
import { BatchUpload } from "@/features/ocr-album/ui/BatchUpload";
import { ProgressTracker } from "@/features/ocr-album/ui/ProgressTracker";
import { OCRSettingsPanel } from "@/features/ocr-settings/ui";
import { useClientRoutes } from "@/shared/hooks/useClientRoutes";
import { BookOpen, HelpCircle, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const OCRPage = () => {
  const { routes } = useClientRoutes();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Japanese OCR Tool
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Upload an image to extract Japanese text with precise
                positioning
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={routes.guide}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">How to Use</span>
              </Link>

              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                <strong>New to this tool?</strong> Check out our{" "}
                <Link
                  href="/guide"
                  className="underline hover:no-underline font-medium"
                >
                  step-by-step guide
                </Link>{" "}
                to learn how to extract Japanese text from manga and books.
              </p>
            </div>
          </div>
        </div>

        <ProgressTracker />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Albums</h2>
          <BatchUpload />
        </div>

        <AlbumList />

        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Get Started
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Create your first album to start extracting Japanese text from
              images
            </p>
            <div className="flex items-center justify-center gap-3">
              <BatchUpload />
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View Guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      <OCRSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};
