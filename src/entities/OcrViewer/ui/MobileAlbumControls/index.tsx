// src/entities/OcrViewer/ui/MobileAlbumControls/index.tsx
import { FC, useState, useRef, useEffect } from "react";
import { 
  Grid3x3, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Share2,
  Bookmark,
  Download,
  Copy,
  X,
  Check
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

interface MobileAlbumControlsProps {
  albumId: string;
  currentPage: number;
  totalPages: number;
  albumName?: string;
  onPageChange?: (page: number) => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onDownloadPage?: () => void;
  onCopyPageText?: () => void;
}

export const MobileAlbumControls: FC<MobileAlbumControlsProps> = ({
  albumId,
  currentPage,
  totalPages,
  albumName,
  onPageChange,
  onShare,
  onBookmark,
  onDownloadPage,
  onCopyPageText,
}) => {
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedPage, setSelectedPage] = useState(currentPage);
  const pageSelectorRef = useRef<HTMLDivElement>(null);

  // Generate page numbers for selector
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Calculate visible page range (show max 10 pages at a time)
  const getVisiblePages = () => {
    const maxVisible = 10;
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    const adjustedStart = Math.max(1, end - maxVisible + 1);
    
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  };

  const visiblePages = getVisiblePages();

  // Handle page selection
  const handlePageSelect = (page: number) => {
    setSelectedPage(page);
  };

  const handlePageConfirm = () => {
    if (selectedPage !== currentPage) {
      onPageChange?.(selectedPage);
      // Navigate to the page
      window.location.href = ROUTES.album({ albumId, page: selectedPage });
    }
    setShowPageSelector(false);
  };

  // Auto-close selectors when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(event.target as Node)) {
        setShowPageSelector(false);
        setShowMoreOptions(false);
      }
    };

    if (showPageSelector || showMoreOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPageSelector, showMoreOptions]);

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <div className="sm:hidden">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        {/* Previous Button */}
        <div className="flex-1">
          {prevPage ? (
            <Link
              href={ROUTES.album({ albumId, page: prevPage })}
              className="flex items-center justify-center py-2 px-4 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Prev</span>
            </Link>
          ) : (
            <div className="flex items-center justify-center py-2 px-4 text-gray-400">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Prev</span>
            </div>
          )}
        </div>

        {/* Page Selector */}
        <div className="flex-shrink-0 relative" ref={pageSelectorRef}>
          <button
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="flex flex-col items-center py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Grid3x3 className="w-5 h-5 text-gray-700 mb-1" />
            <span className="text-xs font-medium text-gray-600">
              {currentPage}/{totalPages}
            </span>
          </button>

          {/* Page Selector Modal */}
          {showPageSelector && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900 text-center">
                  Go to Page
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  {albumName && `${albumName} • `}{totalPages} pages
                </p>
              </div>

              {/* Page Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4 max-h-48 overflow-y-auto">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageSelect(page)}
                    className={`
                      w-10 h-10 rounded-lg text-sm font-medium transition-colors
                      ${page === selectedPage
                        ? 'bg-blue-600 text-white'
                        : page === currentPage
                          ? 'bg-blue-100 text-blue-600 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Quick Jump Input */}
              <div className="mb-4">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Page number"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPageSelector(false)}
                  className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePageConfirm}
                  disabled={selectedPage === currentPage}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedPage === currentPage ? 'Current' : 'Go'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex-1">
          {nextPage ? (
            <Link
              href={ROUTES.album({ albumId, page: nextPage })}
              className="flex items-center justify-center py-2 px-4 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors active:bg-blue-100"
            >
              <span className="text-sm font-medium">Next</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          ) : (
            <div className="flex items-center justify-center py-2 px-4 text-gray-400">
              <span className="text-sm font-medium">Next</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          )}
        </div>

        {/* More Options */}
        <div className="ml-2 relative">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {/* More Options Menu */}
          {showMoreOptions && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 min-w-48">
              <button
                onClick={() => {
                  onShare?.();
                  setShowMoreOptions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center"
              >
                <Share2 className="w-4 h-4 mr-3 text-blue-600" />
                Share Page
              </button>
              
              <button
                onClick={() => {
                  onBookmark?.();
                  setShowMoreOptions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center"
              >
                <Bookmark className="w-4 h-4 mr-3 text-purple-600" />
                Bookmark
              </button>
              
              <button
                onClick={() => {
                  onDownloadPage?.();
                  setShowMoreOptions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-3 text-green-600" />
                Download
              </button>
              
              <button
                onClick={() => {
                  onCopyPageText?.();
                  setShowMoreOptions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center"
              >
                <Copy className="w-4 h-4 mr-3 text-orange-600" />
                Copy Text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 transition-all duration-500 ease-out"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        />
      </div>
    </div>
  );
};