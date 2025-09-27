/**
 * Rotates an image by a specified angle and applies optional enhancements for better OCR readability.
 * @param file - The input image file to rotate.
 * @param angle - The angle to rotate the image (in degrees, typically 90 for vertical Japanese text).
 * @param enhance - Whether to apply image enhancements (contrast, grayscale) for OCR.
 * @returns A promise resolving to an object containing the rotated image file and metadata.
 */
export const rotateImage = async (
  file: File,
  angle: number,
  enhance: boolean = true
): Promise<{ rotatedFile: File; metadata: { isReversed: boolean } }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject(new Error("Failed to read file"));
      img.src = e.target.result as string;
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Failed to get 2D canvas context"));

      // Set canvas dimensions based on rotation
      if (angle % 180 === 0) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else {
        canvas.width = img.height;
        canvas.height = img.width;
      }

      // Apply image enhancements if requested
      if (enhance) {
        ctx.filter = "contrast(1.5) grayscale(100%)"; // Improve OCR readability
      }

      // Perform rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Determine if text order needs reversal (e.g., for 90° or 270° rotations)
      const isReversed = angle % 360 === 90 || angle % 360 === -270;

      // Convert canvas to blob and create a new File
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to convert canvas to blob"));
          const outputType = "image/png"; // PNG for better OCR quality
          const rotatedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), {
            type: outputType,
          });
          resolve({ rotatedFile, metadata: { isReversed } });
        },
        "image/png",
        0.9 // Quality setting for PNG
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
  });
};