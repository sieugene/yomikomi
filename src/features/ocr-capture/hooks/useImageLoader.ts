import { useState, useEffect } from "react";
import { LOADING } from "../lib/constants";

export const useImageLoader = (file: File) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    // Simulate loading progress for UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= LOADING.MAX_SIMULATED_PROGRESS) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + LOADING.PROGRESS_STEP;
      });
    }, LOADING.PROGRESS_INTERVAL);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setProgress(100);

      // Small delay for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, LOADING.TRANSITION_DELAY);

      clearInterval(progressInterval);
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsLoading(false);
    };

    reader.readAsDataURL(file);

    return () => clearInterval(progressInterval);
  }, [file]);

  return { image, isLoading, progress };
};