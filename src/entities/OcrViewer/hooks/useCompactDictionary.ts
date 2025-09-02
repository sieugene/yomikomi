import { useCallback, useState } from "react";

export interface CompactDictionaryState {
  isOpen: boolean;
  selectedText: string | null;
  position: { x: number; y: number } | null;
}

export const useCompactDictionary = () => {
  const [state, setState] = useState<CompactDictionaryState>({
    isOpen: false,
    selectedText: null,
    position: null,
  });

  const handleOpen = useCallback(
    (text: string, position?: { x: number; y: number }) => {
      setState({
        isOpen: true,
        selectedText: text,
        position: position || null,
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setState({
      isOpen: false,
      selectedText: null,
      position: null,
    });
  }, []);

  const handleToggle = useCallback(
    (text: string, position?: { x: number; y: number }) => {
      if (state.isOpen && state.selectedText === text) {
        handleClose();
      } else {
        handleOpen(text, position);
      }
    },
    [state.isOpen, state.selectedText, handleOpen, handleClose]
  );

  return {
    ...state,
    handleOpen,
    handleClose,
    handleToggle,
  };
};
