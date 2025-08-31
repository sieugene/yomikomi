import { useState, useEffect } from "react";

const FIRST_VISIT_KEY = "ocr_viewer_first_visit";
const HINTS_SHOWN_KEY = "ocr_viewer_hints_shown";

export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [shouldShowHints, setShouldShowHints] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstVisit = () => {
      try {
        const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
        const hintsShown = localStorage.getItem(HINTS_SHOWN_KEY);
        
        if (!hasVisited) {
          setIsFirstVisit(true);
          setShouldShowHints(true);
          localStorage.setItem(FIRST_VISIT_KEY, "true");
        } else if (!hintsShown && window.innerWidth < 640) {
          // Show hints for existing users on mobile if they haven't seen them
          setShouldShowHints(true);
        }
      } catch (error) {
        console.warn("Could not access localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstVisit();
  }, []);

  const markHintsAsShown = () => {
    try {
      localStorage.setItem(HINTS_SHOWN_KEY, "true");
      setShouldShowHints(false);
    } catch (error) {
      console.warn("Could not save to localStorage:", error);
    }
  };

  const showHintsManually = () => {
    setShouldShowHints(true);
  };

  const resetFirstVisit = () => {
    try {
      localStorage.removeItem(FIRST_VISIT_KEY);
      localStorage.removeItem(HINTS_SHOWN_KEY);
      setIsFirstVisit(true);
      setShouldShowHints(true);
    } catch (error) {
      console.warn("Could not clear localStorage:", error);
    }
  };

  return {
    isFirstVisit,
    shouldShowHints,
    isLoading,
    markHintsAsShown,
    showHintsManually,
    resetFirstVisit,
  };
};