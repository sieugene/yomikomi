export const parseAnkiMediaJson = (
  mediaFile: string
): Record<string, string> => {
  let mediaArray: Record<string, string> = {};
  try {
    mediaArray = JSON.parse(mediaFile);
  } catch (error) {
    console.warn("Failed to parse media as JSON", error);
  }
  return mediaArray;
};
