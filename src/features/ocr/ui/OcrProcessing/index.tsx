export const OcrProcessing = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <div className="text-gray-700">Processing image with OCR...</div>
      </div>
    </div>
  );
};
