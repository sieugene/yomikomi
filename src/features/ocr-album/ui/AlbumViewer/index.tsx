"use client";

import { OcrViewer } from "@/entities/OcrViewer/ui";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";
import { ALBUM_PAGE_PARAMS } from "@/views/album/types";
import { FC, useMemo } from "react";
import useSWR from "swr";
import { useOCRAlbum } from "../../context/OCRAlbumContext";

type Props = ALBUM_PAGE_PARAMS;

export const AlbumViewer: FC<Props> = ({ albumId, page }) => {
  const { getAlbumImages, isDbReady } = useOCRAlbum();

  const { data, isLoading: dataIsLoading } = useSWR(
    albumId && isDbReady ? `album-images-${albumId}` : null,
    () => getAlbumImages(albumId!)
  );

  const isLoading = dataIsLoading || !isDbReady;
  const totalPages = useMemo(() => data?.length || 0, [data]);
  const pageData = useMemo(() => data?.[page - 1], [data]);

  if (!albumId)
    return (
      <div className="text-center py-10 text-gray-500">
        Select an album to view
      </div>
    );

  if (isLoading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading album data...
      </div>
    );

  if (!pageData) {
    return <div>page data not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-4 text-gray-700 font-medium">
        Order: {pageData.order}
      </div>
      <div>
        <OcrViewer
          originalFile={pageData.originalFile}
          ocrResult={pageData.ocrResult}
          error={pageData.error}
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <NavButton
          label="Prev Page"
          href={
            page > 1 ? ROUTES.album({ albumId, page: page - 1 }) : undefined
          }
          disabled={page === 1}
          variant="secondary"
        />

        <div className="text-gray-700">
          Page {page} of {totalPages}
        </div>

        <NavButton
          label="Next Page"
          href={
            page < totalPages
              ? ROUTES.album({ albumId, page: page + 1 })
              : undefined
          }
          disabled={page === totalPages}
          variant="primary"
        />
      </div>
    </div>
  );
};

type NavButtonProps = {
  label: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

const NavButton: FC<NavButtonProps> = ({
  label,
  href,
  disabled = false,
  onClick,
  variant = "primary",
}) => {
  const baseClasses = "px-4 py-2 rounded cursor-pointer transition-colors";
  const variants = {
    primary: disabled
      ? "bg-blue-500 text-white opacity-50 cursor-not-allowed"
      : "bg-blue-500 text-white hover:bg-blue-600",
    secondary: disabled
      ? "bg-gray-200 text-gray-600 opacity-50 cursor-not-allowed"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
  };

  if (disabled || !href) {
    return (
      <span
        className={`${baseClasses} ${variants[variant]}`}
        onClick={disabled ? undefined : onClick}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};
