
import React, { useEffect, useRef, useState } from "react";

interface SourceTabsProps {
  sources: string[];
  activeSource: string;
  onSourceChange: (source: string) => void;
  resultCounts: Record<string, number>;
}

export const SourceTabs: React.FC<SourceTabsProps> = ({
  sources,
  activeSource,
  onSourceChange,
  resultCounts,
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [sources]);

  const scroll = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative border-b border-gray-200">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white to-transparent px-2"
        >
          <span className="text-gray-600">←</span>
        </button>
      )}

      <div
        ref={tabsRef}
        className="flex overflow-x-auto scrollbar-hide"
        onScroll={checkScroll}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sources.map((source) => (
          <button
            key={source}
            onClick={() => onSourceChange(source)}
            className={`flex-shrink-0 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeSource === source
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {source}
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-gray-100">
              {resultCounts[source] || 0}
            </span>
          </button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white to-transparent px-2"
        >
          <span className="text-gray-600">→</span>
        </button>
      )}
    </div>
  );
};