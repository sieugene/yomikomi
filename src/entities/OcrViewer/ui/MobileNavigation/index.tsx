import { ROUTES } from "@/shared/routes";
import { ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

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
}) => {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <div className="sm:hidden">
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
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
    </div>
  );
};
