import { FC, useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Copy, 
  Download, 
  Volume2, 
  Book, 
  HelpCircle, 
  Settings,
  X,
  VolumeX
} from "lucide-react";
import useClickOutside from "@/shared/hooks/useClickOutside";

interface FloatingActionsProps {
  onCopyAll?: () => void;
  onDownload?: () => void;
  onSpeak?: () => void;
  onShowDictionary?: () => void;
  onShowHelp?: () => void;
  onShowSettings?: () => void;
  isSpeaking?: boolean;
  hasSelectedText?: boolean;
  className?: string;
}

export const FloatingActions: FC<FloatingActionsProps> = ({
  onCopyAll,
  onDownload,
  onSpeak,
  onShowDictionary,
  onShowHelp,
  onShowSettings,
  isSpeaking = false,
  hasSelectedText = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
      setShowLabels(false);
    }
  });

  // Auto-hide labels after a delay
  useEffect(() => {
    if (showLabels) {
      const timer = setTimeout(() => setShowLabels(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLabels]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => setShowLabels(true), 200);
    } else {
      setShowLabels(false);
    }
  };

  const actions = [
    {
      icon: isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />,
      label: isSpeaking ? "Stop Speaking" : "Speak Text",
      action: onSpeak,
      color: "bg-orange-500 hover:bg-orange-600",
      show: hasSelectedText,
    },
    {
      icon: <Book className="w-5 h-5" />,
      label: "Dictionary",
      action: onShowDictionary,
      color: "bg-purple-500 hover:bg-purple-600",
      show: hasSelectedText,
    },
    {
      icon: <Copy className="w-5 h-5" />,
      label: "Copy All",
      action: onCopyAll,
      color: "bg-blue-500 hover:bg-blue-600",
      show: true,
    },
    {
      icon: <Download className="w-5 h-5" />,
      label: "Download",
      action: onDownload,
      color: "bg-green-500 hover:bg-green-600",
      show: true,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      action: onShowSettings,
      color: "bg-gray-500 hover:bg-gray-600",
      show: true,
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: "Help",
      action: onShowHelp,
      color: "bg-indigo-500 hover:bg-indigo-600",
      show: true,
    },
  ].filter(action => action.show && action.action);

  return (
    <div 
      ref={containerRef}
      className={`fixed bottom-20 right-4 z-40 sm:hidden ${className}`}
    >
      <div className="flex flex-col-reverse items-end space-y-reverse space-y-3">
        {/* Action Buttons */}
        {isExpanded && actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Label */}
            {showLabels && (
              <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm">
                {action.label}
              </div>
            )}
            
            {/* Button */}
            <button
              onClick={() => {
                action.action?.();
                setIsExpanded(false);
                setShowLabels(false);
              }}
              className={`
                w-12 h-12 rounded-full text-white shadow-lg
                transition-all duration-200 hover:scale-110 active:scale-95
                ${action.color}
              `}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          </div>
        ))}

        {/* Main FAB */}
        <button
          onClick={toggleExpanded}
          className={`
            w-14 h-14 rounded-full text-white shadow-xl
            transition-all duration-300 hover:scale-110 active:scale-95
            ${isExpanded 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
          aria-label={isExpanded ? "Close menu" : "Open actions menu"}
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] -z-10" />
      )}
    </div>
  );
};