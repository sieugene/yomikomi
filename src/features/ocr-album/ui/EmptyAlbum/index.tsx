"use client";

import { useClientRoutes } from "@/shared/hooks/useClientRoutes";
import { Home, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

interface Props {
  albumId: string;
  albumName: string;
  onAddImage: (file: File) => void;
  onDeleteAlbum: () => void;
}

export const EmptyAlbum: FC<Props> = ({
  albumId,
  albumName,
  onAddImage,
  onDeleteAlbum,
}) => {
  const { routes: ROUTES } = useClientRoutes();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onAddImage(file);
      e.target.value = "";
    }
  };

  const handleDeleteClick = async () => {
    if (
      !window.confirm(`Delete album "${albumName}"? This cannot be undone.`)
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteAlbum();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href={ROUTES.albums}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <Home className="w-4 h-4 mr-1" />
            Back to Albums
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{albumName}</h1>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Text */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Images Yet
          </h2>
          <p className="text-gray-600 mb-6">
            This album is empty. Add your first image to start OCR processing.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {/* Add Image Button */}
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileAdd}
                className="hidden"
                id={`empty-add-image-${albumId}`}
              />
              <div className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Add First Image</span>
              </div>
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Delete Album Button */}
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Album</span>
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> You can upload multiple images at once
              from the albums page, or add them one by one here.
            </p>
          </div>
        </div>

        {/* Mobile: Back Button */}
        <div className="mt-6 sm:hidden">
          <Link
            href={ROUTES.albums}
            className="block w-full px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-center font-medium shadow-sm border border-gray-200"
          >
            ← Back to All Albums
          </Link>
        </div>
      </div>
    </div>
  );
};
