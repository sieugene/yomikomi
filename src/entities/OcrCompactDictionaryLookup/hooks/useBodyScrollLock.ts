import { useEffect } from "react";

// For lock body scroll on mobile 
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.classList.add("overflow-hidden", "sm:overflow-auto");
    } else {
      document.body.classList.remove("overflow-hidden", "sm:overflow-auto");
    }

    return () => {
      document.body.classList.remove("overflow-hidden", "sm:overflow-auto");
    };
  }, [isLocked]);
}
