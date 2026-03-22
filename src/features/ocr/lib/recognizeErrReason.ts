export const recognizeErrReason = (error: string) => {
  const isMemoryErr = error.includes("memory");
  return {
    isUnkown: !isMemoryErr,
    isMemoryErr,
  };
};
