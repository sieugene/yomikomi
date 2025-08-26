import { AlertCircle } from "lucide-react";
import { FC } from "react";

type Props = {
  error: string | null;
};
export const OcrFailure: FC<Props> = ({ error }) => {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="font-medium">Error:</span>
        <span className="ml-1">{error}</span>
      </div>
    </div>
  );
};
