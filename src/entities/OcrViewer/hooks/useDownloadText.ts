import { OCRResponse } from "@/features/ocr/types";

export type UseDownloadTextReturn = ReturnType<typeof useDownloadText>;
export const useDownloadText = () => {
  const handleDownloadText = (result: OCRResponse | null) => {
    if (!result?.full_text) return;
    const blob = new Blob([result.full_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return { handleDownloadText };
};
