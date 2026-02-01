import { ImageIcon } from "lucide-react";
import { FC } from "react";

type Props = {
  label: string;
  text: string;
};
export const ImageConflictState: FC<Props> = ({ label, text }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{label}</h3>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};
