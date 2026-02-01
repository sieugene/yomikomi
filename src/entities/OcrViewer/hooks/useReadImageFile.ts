import { useEffect, useMemo } from "react";
import useSWR from "swr";

type Props = {
  getImageFile: (imageId: string) => Promise<File | null>;
  id: string;
};
export const useReadImageFile = ({ getImageFile, id }: Props) => {
  const { data: imageFile, isLoading } = useSWR(
    !!getImageFile && id && `image-file-${id}`,
    () => getImageFile(id),
  );
  const imageUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);
  return { imageUrl, isLoading };
};
