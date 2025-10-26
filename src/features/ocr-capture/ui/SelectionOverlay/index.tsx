import { FC } from "react";

interface SelectionOverlayProps {
  overlayRef: React.RefObject<HTMLDivElement  | null>;
}

export const SelectionOverlay: FC<SelectionOverlayProps> = ({ overlayRef }) => (
  <div
    ref={overlayRef}
    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none backdrop-blur-[1px] will-change-transform z-40"
    style={{ display: "none" }}
  >
    <div className="size-label absolute -top-8 left-0 text-xs bg-blue-600 text-white px-2 py-1 rounded shadow-lg font-medium">
      0×0
    </div>

    {/* Corner indicators */}
    <div className="absolute top-0 left-0 w-3 h-3 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-600 rounded-full -translate-x-1/2 translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 rounded-full translate-x-1/2 translate-y-1/2" />
  </div>
);
