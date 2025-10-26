"use client";

import { OcrViewer } from "@/entities/OcrViewer/ui";
import { MobileNavigation } from "@/entities/OcrViewer/ui/MobileNavigation";
import { OCRCapture } from "@/features/ocr-capture/ui/OCRCapture";
import { ROUTES } from "@/shared/routes";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { useOCRAlbum } from "../../context/OCRAlbumContext";
import { EmptyAlbum } from "../EmptyAlbum";
import { ImageActionPanel } from "../ImageActionPanel";

type Props = ALBUM_PAGE_PARAMS;

export const AlbumViewer: FC<Props> = ({ albumId, page }) => {
  const router = useRouter();
  const {
    getAlbumImages,
    getAlbum,
    isDbReady,
    getImageFile,
    addImageToAlbum,
    deleteImage,
    deleteAlbum,
    reanalyzeImage,
  } = useOCRAlbum();

  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const { data: images, isLoading: imagesLoading } = useSWR(
    albumId && isDbReady ? `album-images-${albumId}` : null,
    () => getAlbumImages(albumId!)
  );

  const { data: album, isLoading: albumLoading } = useSWR(
    albumId && isDbReady ? `album-${albumId}` : null,
    () => getAlbum(albumId!)
  );

  const { data: currentImageFile } = useSWR(
    images?.[page - 1]?.id ? `image-file-${images[page - 1].id}` : null,
    () => getImageFile(images![page - 1].id)
  );

  const isLoading = imagesLoading || albumLoading || !isDbReady;
  const totalPages = useMemo(() => images?.length || 0, [images]);
  const pageData = useMemo(() => images?.[page - 1], [images, page]);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const refreshData = () => {
    mutate(`album-images-${albumId}`);
    mutate(`album-${albumId}`);
    if (pageData) {
      mutate(`image-file-${pageData.id}`);
    }
  };

  const handleReanalyze = async () => {
    if (!pageData || !albumId) return;

    setIsReanalyzing(true);
    try {
      await reanalyzeImage(pageData.id, albumId);
      refreshData();
      toast.success("Image reanalyzed successfully");
    } catch (error) {
      console.error("Reanalyze failed:", error);
      toast.error("Failed to reanalyze image");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!pageData || !albumId) return;

    try {
      await deleteImage(pageData.id, albumId);

      // Refresh data first to get updated totals
      await mutate(`album-images-${albumId}`);
      await mutate(`album-${albumId}`);

      // Check if this was the last image
      const updatedImages = await getAlbumImages(albumId);

      if (updatedImages.length === 0) {
        // Last image deleted - stay on album page but show empty state
        // The component will re-render and show EmptyAlbumState
        toast.success("Last image deleted");
      } else if (totalPages > 1) {
        // Navigate to another page if exists
        const newPage = page > 1 ? page - 1 : 1;
        router.push(ROUTES.album({ albumId, page: newPage }));
        toast.success("Image deleted");
      } else {
        // Single page, but not last image (edge case)
        toast.success("Image deleted");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleAddImage = async (file: File) => {
    if (!albumId || !images) return;

    try {
      const maxOrder = Math.max(...images.map((img) => img.order), -1);
      await addImageToAlbum(albumId, file, maxOrder + 1);
      refreshData();
      toast.success("Image added to album");
    } catch (error) {
      console.error("Add image failed:", error);
      toast.error("Failed to add image");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Album
          </h2>
          <p className="text-gray-600">
            Please wait while we load your OCR results...
          </p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Album
          </h2>
          <p className="text-gray-600 mb-4">
            The album ID is missing or invalid.
          </p>
          <Link
            href={ROUTES.albums}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to albums
          </Link>
        </div>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <EmptyAlbum
        albumId={albumId}
        albumName={album?.name || "Album"}
        onAddImage={handleAddImage}
        onDeleteAlbum={async () => {
          try {
            await deleteAlbum(albumId);
            router.push(ROUTES.albums);
            toast.success("Album deleted");
          } catch (error) {
            console.error("Delete album failed:", error);
            toast.error("Failed to delete album");
          }
        }}
      />
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Page {page} {`doesn't`} exist in this album. There are {totalPages}{" "}
            pages available.
          </p>
          <div className="space-y-2">
            <Link
              href={ROUTES.album({ albumId, page: 1 })}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to First Page
            </Link>
            <Link
              href={ROUTES.albums}
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

      <ImageActionPanel
        imageId={pageData.id}
        imageFile={currentImageFile || null}
        onReanalyze={handleReanalyze}
        onDelete={handleDelete}
        onAddImage={handleAddImage}
        onSelectArea={() => setShowCaptureModal(true)}
        isProcessing={isReanalyzing}
      />

      {/* Main Content */}
      <div className="pb-4 sm:pb-8">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-8 mb-6">
          {/* OCR Viewer */}
          <OcrViewer
            id={pageData.id}
            ocrResult={pageData.ocrResult}
            error={pageData.error}
            status={pageData.status}
            getImageFile={getImageFile}
            onStartProcessing={handleReanalyze}
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:block sticky bottom-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NavButton
              label="Previous Page"
              href={
                prevPage ? ROUTES.album({ albumId, page: prevPage }) : undefined
              }
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
              href={
                nextPage ? ROUTES.album({ albumId, page: nextPage }) : undefined
              }
              disabled={!nextPage}
              variant="primary"
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            />
          </div>
        </div>
      </div>

      {/* OCR Capture Modal */}
      {showCaptureModal && currentImageFile && (
        <OCRCapture
          imageFile={currentImageFile}
          onClose={() => setShowCaptureModal(false)}
        />
      )}
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
  const baseClasses =
    "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors";
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
    return (
      <div className={`${baseClasses} ${variants[variant]}`}>{content}</div>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${variants[variant]}`}>
      {content}
    </Link>
  );
};
