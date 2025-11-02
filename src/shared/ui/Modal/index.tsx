import { XCircle } from "lucide-react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
  withCloseBtn?: boolean;
  actionMenuBtn?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  maxWidth = "max-w-2xl",
  children,
  actionMenuBtn,
  withCloseBtn = true,
  className = "",
  style = {}
}) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`} style={style}>
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto m-4`}
      >
        <div className="p-6">
          {title && (
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              )}
              {actionMenuBtn ? actionMenuBtn : <div />}
              {onClose && withCloseBtn && (
                <button
                  onClick={onClose}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
