import { OCRAlbumImage, Status } from "../types";

export const getAlbumStatus = (images: OCRAlbumImage[]): Status => {
  const errorCount = images.filter((i) => !!i.error).length;
  const completedCount = images.filter((i) => !!i.ocrResult).length;

  if (!errorCount && completedCount) {
    return Status.COMPLETED;
  }
  if (errorCount) {
    return Status.FAILED;
  }
  return Status.PENDING;
};

export const getAlbumImageStatus = (image: OCRAlbumImage | undefined) => {
  const hasError = image?.error;
  const hasCompleted = image?.ocrResult;
  if (!hasError && hasCompleted) {
    return Status.COMPLETED;
  }
  if (hasError) {
    return Status.FAILED;
  }
  return Status.PENDING;
};
