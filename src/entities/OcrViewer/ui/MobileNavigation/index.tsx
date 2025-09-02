// src/entities/OcrViewer/ui/MobileNavigation/index.tsx
import { FC } from "react";
import { ChevronLeft, ChevronRight, Grid3x3, Home, Share2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

interface MobileNavigationProps {
  albumId: string;
  currentPage: number;
  totalPages: number;
  albumName?: string;
}

export const MobileNavigation: FC<MobileNavigationProps> = ({
  albumId,
  currentPage,
  totalPages,
  albumName,
}) => {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${albumName || 'OCR Album'} - Page ${currentPage}`,
          text: `Check out this OCR result from ${albumName || 'our album'}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  return (
    <div className="sm:hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href={ROUTES.home}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {albumName || 'OCR Album'}
            </h1>
            <p className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <button
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center">
          {/* Previous Button */}
          <div className="flex-1">
            {prevPage ? (
              <Link
                href={ROUTES.album({ albumId, page: prevPage })}
                className="flex items-center justify-center py-4 text-blue-600 hover:bg-blue-50 transition-colors active:bg-blue-100"
              >
                <ChevronLeft className="w-6 h-6 mr-1" />
                <span className="text-sm font-medium">Previous</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center py-4 text-gray-400">
                <ChevronLeft className="w-6 h-6 mr-1" />
                <span className="text-sm font-medium">Previous</span>
              </div>
            )}
          </div>

          {/* Page Indicator with Grid View */}
          <div className="flex-shrink-0 px-4">
            <div className="flex flex-col items-center">
              <Grid3x3 className="w-5 h-5 text-gray-600 mb-1" />
              <div className="text-xs text-gray-600">
                {currentPage}/{totalPages}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex-1">
            {nextPage ? (
              <Link
                href={ROUTES.album({ albumId, page: nextPage })}
                className="flex items-center justify-center py-4 text-blue-600 hover:bg-blue-50 transition-colors active:bg-blue-100"
              >
                <span className="text-sm font-medium">Next</span>
                <ChevronRight className="w-6 h-6 ml-1" />
              </Link>
            ) : (
              <div className="flex items-center justify-center py-4 text-gray-400">
                <span className="text-sm font-medium">Next</span>
                <ChevronRight className="w-6 h-6 ml-1" />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-16" />
    </div>
  );
};