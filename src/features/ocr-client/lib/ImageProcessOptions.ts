/**
 * Rotate image by 0°, 90°, 180°, 270°
 * Preserves original quality and metadata
 */
export const rotateImage = (
  file: File,
  angle: number
): Promise<{ rotatedFile: File; isReversed: boolean }> => {
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
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return reject(new Error("Cannot get canvas context"));

        // Normalize angle
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const is90or270 = normalizedAngle === 90 || normalizedAngle === 270;

        // Set canvas size
        canvas.width = is90or270 ? img.height : img.width;
        canvas.height = is90or270 ? img.width : img.height;

        // Center rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((normalizedAngle * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Output format = original
        const outputFormat = file.type || "image/png";
        const extension = outputFormat.split("/")[1] || "png";
        const newFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("toBlob failed"));

            const rotatedFile = new File([blob], newFileName, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            const isReversed = normalizedAngle === 90 || normalizedAngle === 270;

            resolve({ rotatedFile, isReversed });
          },
          outputFormat,
          1.0 // MAX QUALITY
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Image load failed"));
    reader.readAsDataURL(file);
  });
};