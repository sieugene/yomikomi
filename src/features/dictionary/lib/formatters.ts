export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const formatSearchStats = (
  resultCount: number,
  uniqueWords: number,
  searchTime?: number
): string => {
  const parts = [`${resultCount} results`, `${uniqueWords} unique words`];

  if (searchTime !== undefined) {
    parts.push(`${searchTime.toFixed(0)}ms`);
  }

  return parts.join(" • ");
};
