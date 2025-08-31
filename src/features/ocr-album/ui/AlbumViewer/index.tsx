"use client";

import { OcrViewer } from "@/entities/OcrViewer/ui";
import { MobileNavigation } from "@/entities/OcrViewer/ui/MobileNavigation";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { FC, useMemo } from "react";
import useSWR from "swr";
import { useOCRAlbum } from "../../context/OCRAlbumContext";
import { ChevronLeft, ChevronRight, Home, AlertCircle, Loader2 } from "lucide-react";

type Props = ALBUM_PAGE_PARAMS;

export const AlbumViewer: FC<Props> = ({ albumId, page }) => {
  const { getAlbumImages, getAlbum, isDbReady } = useOCRAlbum();

  const { data: images, isLoading: imagesLoading } = useSWR(
    albumId && isDbReady ? `album-images-${albumId}` : null,
    () => getAlbumImages(albumId!)
  );

  const { data: album, isLoading: albumLoading } = useSWR(
    albumId && isDbReady ? `album-${albumId}` : null,
    () => getAlbum(albumId!)
  );

  const isLoading = imagesLoading || albumLoading || !isDbReady;
  const totalPages = useMemo(() => images?.length || 0, [images]);
  const pageData = useMemo(() => images?.[page - 1], [images, page]);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Album</h2>
          <p className="text-gray-600">Please wait while we load your OCR results...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (!albumId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Album</h2>
          <p className="text-gray-600 mb-4">The album ID is missing or invalid.</p>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-4">
            Page {page} doesn't exist in this album. There are {totalPages} pages available.
          </p>
          <div className="space-y-2">
            <Link
              href={ROUTES.album({ albumId, page: 1 })}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to First Page
            </Link>
            <Link
              href={ROUTES.home}
              className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Albums
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation
        albumId={albumId}
        currentPage={page}
        totalPages={totalPages}
        albumName={album?.name}
      />

      {/* Desktop Header */}
      <div className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={ROUTES.home}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-2"
              >
                <Home className="w-4 h-4 mr-1" />
                Back to Albums
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {album?.name || 'OCR Album'}
              </h1>
              <p className="text-gray-600">
                Image {pageData.order + 1} of {totalPages} • {pageData.filename}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Page Navigation</div>
              <div className="text-lg font-semibold text-gray-900">
                {page} / {totalPages}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-4 sm:pb-8">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-8">
          {/* Mobile Page Info */}
          <div className="sm:hidden mb-4 px-2">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">
                Image {pageData.order + 1} • {pageData.filename}
              </div>
              {pageData.status && (
                <div className={`text-xs mt-1 font-medium ${
                  pageData.status === 'completed' ? 'text-green-600' :
                  pageData.status === 'failed' ? 'text-red-600' :
                  pageData.status === 'processing' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  Status: {pageData.status.charAt(0).toUpperCase() + pageData.status.slice(1)}
                </div>
              )}
            </div>
          </div>

          {/* OCR Viewer */}
          <OcrViewer
            originalFile={pageData.originalFile}
            ocrResult={pageData.ocrResult}
            error={pageData.error}
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:block sticky bottom-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NavButton
              label="Previous Page"
              href={prevPage ? ROUTES.album({ albumId, page: prevPage }) : undefined}
              disabled={!prevPage}
              variant="secondary"
              icon={<ChevronLeft className="w-4 h-4" />}
            />

            <div className="text-center">
              <div className="text-sm text-gray-500">Page Navigation</div>
              <div className="text-lg font-semibold text-gray-900">
                {page} of {totalPages}
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(page / totalPages) * 100}%` }}
                />
              </div>
            </div>

            <NavButton
              label="Next Page"
              href={nextPage ? ROUTES.album({ albumId, page: nextPage }) : undefined}
              disabled={!nextPage}
              variant="primary"
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Desktop Navigation Button Component
interface NavButtonProps {
  label: string;
  href?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const NavButton: FC<NavButtonProps> = ({
  label,
  href,
  disabled = false,
  variant = "primary",
  icon,
  iconPosition = "left",
}) => {
  const baseClasses = "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-blue-600 text-white hover:bg-blue-700",
    secondary: disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
  };

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {label}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </>
  );

  if (disabled || !href) {
    return <div className={`${baseClasses} ${variants[variant]}`}>{content}</div>;
  }

  return (
    <Link href={href} className={`${baseClasses} ${variants[variant]}`}>
      {content}
    </Link>
  );
};