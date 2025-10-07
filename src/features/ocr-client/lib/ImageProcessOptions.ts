export interface ImageProcessOptions {
  /** Target size for letterbox resize (default: 960) */
  targetSize?: number;
  /** Rotation angle in degrees (0, 90, 180, 270, -90, etc.) */
  rotationAngle?: number;
  /** Upscale factor (e.g., 2 for 2x upscaling). Applied before other operations */
  upscaleFactor?: number;
  /** Apply OCR enhancements (contrast, grayscale) */
  enhanceForOCR?: boolean;
  /** Output image quality (0.0 - 1.0, default: 0.95) */
  quality?: number;
  /** Force output format (default: keeps original or 'image/png' if enhanced) */
  outputFormat?: string;
  /** Background color for letterbox padding (default: 'white') */
  backgroundColor?: string;
}

export interface ImageProcessResult {
  processedFile: File;
  metadata: {
    originalWidth: number;
    originalHeight: number;
    finalWidth: number;
    finalHeight: number;
    wasUpscaled: boolean;
    wasRotated: boolean;
    wasResized: boolean;
    isReversed: boolean; // For text order (90° or 270° rotations)
  };
}

/**
 * Unified image processing: upscale → rotate → letterbox resize
 * All operations in a single canvas pass for maximum performance
 */
export const processImage = async (
  file: File,
  options: ImageProcessOptions = {}
): Promise<ImageProcessResult> => {
  const {
    targetSize = 960,
    rotationAngle = 0,
    upscaleFactor = 1,
    enhanceForOCR = false,
    quality = 0.95,
    outputFormat,
    backgroundColor = "white",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject(new Error("Failed to read file"));
      img.src = e.target.result as string;
    };

    reader.onerror = () => reject(new Error("FileReader error"));

    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Step 1: Apply upscaling if needed
        const upscaledWidth = img.width * upscaleFactor;
        const upscaledHeight = img.height * upscaleFactor;

        // Step 2: Determine canvas size after rotation
        const needsRotation = rotationAngle % 360 !== 0;
        const rotatesBy90 = Math.abs(rotationAngle % 180) === 90;

        let rotatedWidth = upscaledWidth;
        let rotatedHeight = upscaledHeight;

        if (needsRotation && rotatesBy90) {
          rotatedWidth = upscaledHeight;
          rotatedHeight = upscaledWidth;
        }

        // Step 3: Calculate letterbox dimensions
        const ratio = Math.min(
          targetSize / rotatedWidth,
          targetSize / rotatedHeight
        );
        const finalWidth = rotatedWidth * ratio;
        const finalHeight = rotatedHeight * ratio;
        const xOffset = (targetSize - finalWidth) / 2;
        const yOffset = (targetSize - finalHeight) / 2;

        // Create final canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return reject(new Error("Cannot get canvas context"));

        // Configure rendering quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Apply OCR enhancements if needed (contrast only, no grayscale)
        if (enhanceForOCR) {
          ctx.filter = "contrast(1.2) brightness(1.05)";
        }

        // Fill background (letterbox padding)
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Apply all transformations in one draw call
        ctx.save();

        // Translate to center of final image area
        ctx.translate(xOffset + finalWidth / 2, yOffset + finalHeight / 2);

        // Apply rotation if needed
        if (needsRotation) {
          ctx.rotate((rotationAngle * Math.PI) / 180);
        }

        // Draw image with upscaling and resize in one operation
        ctx.drawImage(
          img,
          -finalWidth / 2,
          -finalHeight / 2,
          finalWidth,
          finalHeight
        );

        ctx.restore();

        // Determine if text order is reversed (for vertical text handling)
        const isReversed =
          rotationAngle % 360 === 90 || rotationAngle % 360 === -270;

        // Determine output format
        const format =
          outputFormat ||
          (enhanceForOCR ? "image/png" : file.type) ||
          "image/png";

        const extension = format.split("/")[1] || "png";
        const newFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));

            const processedFile = new File([blob], newFileName, {
              type: format,
              lastModified: Date.now(),
            });

            resolve({
              processedFile,
              metadata: {
                originalWidth,
                originalHeight,
                finalWidth: targetSize,
                finalHeight: targetSize,
                wasUpscaled: upscaleFactor > 1,
                wasRotated: needsRotation,
                wasResized: ratio !== 1,
                isReversed,
              },
            });
          },
          format,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    reader.readAsDataURL(file);
  });
};

// Convenience wrappers for common use cases

/** Simple resize with letterbox */
export const resizeImageLetterbox = (file: File, size = 960): Promise<File> => {
  return processImage(file, { targetSize: size }).then(
    (result) => result.processedFile
  );
};

/** Rotate image (with optional enhancement) */
export const rotateImage = (
  file: File,
  angle: number,
  enhance = true
): Promise<{ rotatedFile: File; metadata: { isReversed: boolean } }> => {
  return processImage(file, {
    rotationAngle: angle,
    enhanceForOCR: enhance,
    targetSize: 0, // No letterbox, just rotation
  }).then((result) => ({
    rotatedFile: result.processedFile,
    metadata: { isReversed: result.metadata.isReversed },
  }));
};

/** Upscale and prepare for OCR */
export const upscaleForOCR = (
  file: File,
  factor = 2,
  targetSize = 960
): Promise<File> => {
  return processImage(file, {
    upscaleFactor: factor,
    targetSize,
    enhanceForOCR: true,
  }).then((result) => result.processedFile);
};
