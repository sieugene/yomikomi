export const generateFilename = (
  originalName: string,
  index: number
): string => {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop() || "jpg";
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}_${String(index + 1).padStart(
    3,
    "0"
  )}_${timestamp}.${extension}`;
};

export const createAlbumId = () =>
  `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const createAlbumImageId = (albumId: string, index: number) =>
  `image_${albumId}_${index}`;
