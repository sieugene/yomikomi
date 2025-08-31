import { FC, useEffect, useRef } from "react";
import { 
  Copy, 
  Book, 
  Share2, 
  Search, 
  Volume2, 
  Bookmark,
  X 
} from "lucide-react";
import useClickOutside from "@/shared/hooks/useClickOutside";

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
  onClose: () => void;
  onCopy: () => void;
  onTranslate: () => void;
  onSearch: () => void;
  onSpeak?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

export const ContextMenu: FC<ContextMenuProps> = ({
  isOpen,
  position,
  selectedText,
  onClose,
  onCopy,
  onTranslate,
  onSearch,
  onSpeak,
  onBookmark,
  onShare,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(menuRef, onClose);

  // Position adjustment to keep menu in viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position
    if (adjustedX + rect.width > viewport.width - 20) {
      adjustedX = viewport.width - rect.width - 20;
    }
    if (adjustedX < 20) {
      adjustedX = 20;
    }

    // Adjust vertical position
    if (adjustedY + rect.height > viewport.height - 20) {
      adjustedY = position.y - rect.height - 10;
    }
    if (adjustedY < 20) {
      adjustedY = 20;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [isOpen, position]);

  if (!isOpen) return null;

  const truncatedText = selectedText.length > 30 
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

  // Add optional actions
  if (onSpeak && 'speechSynthesis' in window) {
    menuItems.push({
      icon: <Volume2 className="w-4 h-4" />,
      label: "Speak",
      action: onSpeak,
      color: "text-orange-600",
    });
  }

  if (onBookmark) {
    menuItems.push({
      icon: <Bookmark className="w-4 h-4" />,
      label: "Bookmark",
      action: onBookmark,
      color: "text-purple-600",
    });
  }

  if (onShare && navigator.share) {
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
      className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '200px',
        maxWidth: '280px',
        transform: 'translateZ(0)', // Force hardware acceleration
      }}
    >
      {/* Header with selected text */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <div className="text-xs font-medium text-gray-500 mb-1">
              Selected Text
            </div>
            <div className="text-sm text-gray-900 font-medium leading-tight">
              "{truncatedText}"
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
            className={`
              w-full flex items-center px-4 py-3 text-left text-sm font-medium
              transition-colors duration-150 hover:bg-gray-50 active:bg-gray-100
              ${item.color || 'text-gray-700'}
            `}
          >
            <span className={`mr-3 ${item.color || 'text-gray-500'}`}>
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

      {/* Mobile-specific hint */}
      <div className="sm:hidden px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          Long press for more options
        </div>
      </div>
    </div>
  );
};