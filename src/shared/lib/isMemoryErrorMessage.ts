export const isMemoryErrorMessage = (message: string) => {
  const isOOM =
    message?.toLowerCase().includes("memory") ||
    message.toLowerCase().includes("oom");

  const OOM_ERROR = `Not enough memory. Close other tabs in browser or try clear page cache.`;
  return `${isOOM ? OOM_ERROR : message}`;
};
