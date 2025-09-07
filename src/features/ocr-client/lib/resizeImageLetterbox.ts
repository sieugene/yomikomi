export const resizeImageLetterbox = (file: File, size = 960): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject("Failed to read file");
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Cannot get canvas context");

      ctx.fillStyle = "white"; // фон
      ctx.fillRect(0, 0, size, size);

      const ratio = Math.min(size / img.width, size / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      const xOffset = (size - newWidth) / 2;
      const yOffset = (size - newHeight) / 2;

      ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        } else reject("Canvas toBlob failed");
      }, file.type);
    };

    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};
