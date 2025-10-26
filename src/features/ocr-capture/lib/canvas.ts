import { SelectionBounds } from "./coordinates";

export interface CropImageOptions {
  imageElement: HTMLImageElement;
  bounds: SelectionBounds;
  fileName: string;
  fileType: string;
}

/**
 * Crop image based on selection bounds and return as File
 */
export const cropImageToFile = async ({
  imageElement,
  bounds,
  fileName,
  fileType,
}: CropImageOptions): Promise<File> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = bounds.width;
  canvas.height = bounds.height;

  ctx.drawImage(
    imageElement,
    bounds.minX,
    bounds.minY,
    bounds.width,
    bounds.height,
    0,
    0,
    bounds.width,
    bounds.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create cropped image blob"));
        return;
      }

      const croppedFile = new File([blob], `cropped_${fileName}`, {
        type: fileType,
      });
      resolve(croppedFile);
    }, fileType);
  });
};