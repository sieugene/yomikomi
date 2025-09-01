import { useState } from "react";

export const useTextBlockSettings = () => {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [textScale, setTextScale] = useState(1);
  const [imageTransparency, setImageTransparency] = useState(1);
  const [fontTransparency, setFontTransparency] = useState(1);
  const [showDictionary, setShowDictionary] = useState(true);

  return {
    showBoundingBoxes,
    setShowBoundingBoxes,
    textScale,
    setTextScale,
    imageTransparency,
    setImageTransparency,
    fontTransparency,
    setFontTransparency,
    showDictionary,
    setShowDictionary,
  };
};
