import { toast } from "sonner";
import { OCRAlbumIndexedDB } from "../services/indexedDbService";
import useSWR from "swr";
import { useMemo } from "react";
import { OCRAlbumAlbum, OCRAlbumImage } from "../types";

export const useAlbumRepository = () => {
  const { data: db, isLoading: dbIsLoading } = useSWR("album-db", async () => {
    try {
      const db = new OCRAlbumIndexedDB();
      await db.init();
      return db;
    } catch (error) {
      console.error(error);
      toast("Failed to initialize OCR Album database:");
      return null;
    }
  });
  const isDbReady = useMemo(() => !!db && !dbIsLoading, [dbIsLoading, db]);

  const {
    data,
    isLoading: getAllAlbumsIsLoading,
    mutate: mutateAlbums,
  } = useSWR(db && "albums", async () => {
    return db?.getAllAlbums();
  });

  const createAlbum = async (album: OCRAlbumAlbum) => {
    return await db?.createAlbum(album);
  };

  const getAlbum = async (albumId: string): Promise<OCRAlbumAlbum | null> => {
    if (!isDbReady) return null;
    const album = await db?.getAlbum(albumId);
    return album || null;
  };

  const getAlbumImages = async (albumId: string): Promise<OCRAlbumImage[]> => {
    if (!isDbReady) return [];
    const images = await db?.getAlbumImages(albumId);
    return images || [];
  };

  const deleteAlbum = async (albumId: string): Promise<void> => {
    if (!isDbReady) throw new Error("Database not ready");

    await db?.deleteAlbum(albumId);
    await mutateAlbums();
  };

  const getImageFile = async (imageId: string): Promise<File | null> => {
    if (!isDbReady) return null;
    const imageFile = await db?.getImageFile(imageId);
    return imageFile || null;
  };

  return {
    isDbReady,
    db: db || null,
    albums: data || [],
    refetchAlbums: async () => {
      await mutateAlbums();
    },
    loading: getAllAlbumsIsLoading || dbIsLoading,
    createAlbum,
    getAlbum,
    getAlbumImages,
    getImageFile,
    deleteAlbum,
  };
};
