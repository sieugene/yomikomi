export const rotateImage = (
  file: File,
  angle: number,
  maxSize = 1280,
): Promise<{ rotatedFile: File; isReversed: boolean }> => {
  return new Promise((resolve, reject) => {
    createImageBitmap(file)
      .then((bitmap) => {
        try {
          const normalizedAngle = ((angle % 360) + 360) % 360;
          const is90or270 = normalizedAngle === 90 || normalizedAngle === 270;

          const rawW = is90or270 ? bitmap.height : bitmap.width;
          const rawH = is90or270 ? bitmap.width : bitmap.height;

          const scale = Math.min(1, maxSize / Math.max(rawW, rawH));
          const w = Math.floor(rawW * scale);
          const h = Math.floor(rawH * scale);

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext("2d", { alpha: true });
          if (!ctx) return reject(new Error("Cannot get canvas context"));

          ctx.translate(w / 2, h / 2);
          ctx.scale(scale, scale);
          ctx.rotate((normalizedAngle * Math.PI) / 180);
          ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
          bitmap.close();

          const outputFormat = file.type || "image/png";
          const extension = outputFormat.split("/")[1] || "png";
          const newFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("toBlob failed"));
              resolve({
                rotatedFile: new File([blob], newFileName, {
                  type: outputFormat,
                  lastModified: Date.now(),
                }),
                isReversed: normalizedAngle === 90 || normalizedAngle === 270,
              });
            },
            outputFormat,
            0.92,
          );
        } catch (error) {
          reject(error);
        }
      })
      .catch(() => reject(new Error("Image load failed")));
  });
};