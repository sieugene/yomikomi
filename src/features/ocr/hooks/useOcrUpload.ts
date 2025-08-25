import { useCallback, useState } from "react";

export type UseOcrUploadReturn = ReturnType<typeof useOcrUpload>;
export const useOcrUpload = (reset: () => void) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      reset();
    },
    [reset]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));
      if (imageFile) {
        handleFileSelect(imageFile);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleReset = () => {
    setSelectedFile(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
  };

  return {
    handleReset,
    handleFileInput,
    handleDrop,
    handleDragOver,
    selectedFile,
    imageUrl,
  };
};
