import { FC } from "react";
import { OCRCatalogAlbum } from "../../types";
import { useOCRCatalog } from "../../context/OCRCatalogContext";
import useSWR from "swr";
import { OcrViewer } from "@/entities/OcrViewer/ui";

type Props = {
  albumId: OCRCatalogAlbum["id"] | null;
};
export const AlbumViewer: FC<Props> = ({ albumId }) => {
  const { getAlbumImages } = useOCRCatalog();
  const { data, isLoading } = useSWR(
    albumId ? `album-images-${albumId}` : null,
    () => getAlbumImages(albumId!)
  );

  if (!albumId) return <div>Select an album to view</div>;
  if (isLoading) return <div>Loading album data...</div>;
  return (
    <>
      {data?.map((imageData) => {
        return <OcrViewer key={imageData.order} data={imageData} />;
      })}
    </>
  );
};
