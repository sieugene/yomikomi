"use client";

import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";

type Props = {
  setFile: Dispatch<SetStateAction<File | null>>;
  disabled: boolean;
  selectedFile: File | null;
};

export const Import: FC<Props> = ({ setFile, disabled, selectedFile }) => {
  const fileName = useMemo(() => selectedFile?.name || "", [selectedFile]);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        setFile(file);
      }
    },
    [disabled, setFile]
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files?.length) {
      const file = e.target.files[0];
      if (file) {
        setFile(file);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      document.getElementById("fileInput")?.click();
    }
  };

  return (
    <>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClick}
        className={`w-full max-w-xl p-10 border-4 border-dashed rounded-xl shadow-lg text-center transition-colors ${
          disabled
            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-white border-indigo-400 text-indigo-700 cursor-pointer hover:border-indigo-600"
        }`}
      >
        <input
          disabled={disabled}
          type="file"
          id="fileInput"
          className="hidden"
          accept=".apkg"
          onChange={onFileChange}
        />
        <p className="text-lg">
          {fileName
            ? `Selected File: ${fileName}`
            : "Drag and drop your deck file here or click to select"}
        </p>
      </div>
    </>
  );
};
