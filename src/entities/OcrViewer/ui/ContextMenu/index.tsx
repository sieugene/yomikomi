import useClickOutside from "@/shared/hooks/useClickOutside";
import { Book, Bookmark, Copy, Search, Share2, X } from "lucide-react";
import { FC, useRef } from "react";

interface ContextMenuProps {
  coordsY: number;
  isOpen: boolean;
  selectedText: string;
  onClose: () => void;
  onCopy: () => void;
  onTranslate: () => void;
  onSearch: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  className?: string
}

export const ContextMenu: FC<ContextMenuProps> = ({
  coordsY,
  isOpen,
  selectedText,
  onClose,
  onCopy,
  onTranslate,
  onSearch,
  onBookmark,
  onShare,
  className
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose);

  if (!isOpen) return null;

  const truncatedText =
    selectedText.length > 30
      ? `${selectedText.substring(0, 30)}...`
      : selectedText;

  const menuItems = [
    {
      icon: <Copy className="w-4 h-4" />,
      label: "Copy",
      action: onCopy,
      shortcut: "⌘C",
    },
    {
      icon: <Book className="w-4 h-4" />,
      label: "Translate",
      action: onTranslate,
      color: "text-blue-600",
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: "Search",
      action: onSearch,
      color: "text-green-600",
    },
  ];

  if (onBookmark) {
    menuItems.push({
      icon: <Bookmark className="w-4 h-4" />,
      label: "Bookmark",
      action: onBookmark,
      color: "text-purple-600",
    });
  }

  if (onShare && !!navigator.share) {
    menuItems.push({
      icon: <Share2 className="w-4 h-4" />,
      label: "Share",
      action: onShare,
      color: "text-indigo-600",
    });
  }

  return (
    <div
      ref={menuRef}
      style={{
        top: coordsY,
      }}
      className={`absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-30 min-w-[200px] max-w-[280px] ${className || ""}`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <div className="text-xs font-medium text-gray-500 mb-1">
              Selected Text
            </div>
            <div className="text-sm text-gray-900 font-medium leading-tight">
              {truncatedText}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium
              transition-colors duration-150 hover:bg-gray-50 active:bg-gray-100
              ${item.color || "text-gray-700"}`}
          >
            <span className={`mr-3 ${item.color || "text-gray-500"}`}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400 ml-2">
                {item.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile hint */}
      <div className="sm:hidden px-4 py-2 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
        Long press for more options
      </div>
    </div>
  );
};
