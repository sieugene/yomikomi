import { BaseStoreManager } from "@/features/storage/model/BaseStoreManager";
import { OCRAlbumAlbum, OCRAlbumImage } from "../types";

const DB_NAME = "OCRAlbumDB";
const DB_VERSION = 1;
const ALBUMS_STORE = "albums";
const IMAGES_STORE = "images";
const FILES_STORE = "files";

interface StoredFile {
  id: string;
  file: File;
}

class AlbumStore extends BaseStoreManager<OCRAlbumAlbum> {}
class ImageStore extends BaseStoreManager<OCRAlbumImage> {}
class FileStore extends BaseStoreManager<StoredFile> {
  protected asFile(data: StoredFile): File | null {
    return data.file;
  }
}

export class OCRAlbumIndexedDB {
  private albums: AlbumStore;
  private images: ImageStore;
  private files: FileStore;

  constructor() {
    this.albums = new AlbumStore(DB_NAME, ALBUMS_STORE);
    this.images = new ImageStore(DB_NAME, IMAGES_STORE);
    this.files = new FileStore(DB_NAME, FILES_STORE);
  }

  async init(): Promise<void> {
    const dbOpen = indexedDB.open(DB_NAME, DB_VERSION);

    dbOpen.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
        const store = db.createObjectStore(ALBUMS_STORE, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        const store = db.createObjectStore(IMAGES_STORE, { keyPath: "id" });
        store.createIndex("albumId", "albumId", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("order", "order", { unique: false });
      }

      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "id" });
      }
    };

    await Promise.all([
      this.albums.init(),
      this.images.init(),
      this.files.init(),
    ]);
  }

  createAlbum(album: OCRAlbumAlbum) {
    return this.albums.save(album);
  }

  updateAlbum(album: OCRAlbumAlbum) {
    return this.albums.save(album);
  }

  getAlbum(albumId: string): Promise<OCRAlbumAlbum | null> {
    return this.albums.get(albumId);
  }

  async getAllAlbums(): Promise<OCRAlbumAlbum[]> {
    const albums = await this.albums.list();
    return albums.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  async deleteAlbum(albumId: string): Promise<void> {
    const images = await this.getAlbumImages(albumId);

    await Promise.all(images.map((img) => this.files.delete(`file_${img.id}`)));

    await Promise.all(images.map((img) => this.images.delete(img.id)));

    await this.albums.delete(albumId);
  }

  createImage(image: OCRAlbumImage) {
    return this.images.save(image);
  }

  updateImage(image: OCRAlbumImage) {
    return this.images.save(image);
  }

  async getAlbumImages(albumId: string): Promise<OCRAlbumImage[]> {
    return new Promise((resolve, reject) => {
      const tx = this.images.getDb()!.transaction(IMAGES_STORE, "readonly");

      const store = tx.objectStore(IMAGES_STORE);
      const index = store.index("albumId");
      const request = index.getAll(albumId);

      request.onsuccess = () => {
        const images = request.result.sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        resolve(images);
      };
      request.onerror = () => reject(request.error);
    });
  }

  storeFile(fileId: string, file: File) {
    return this.files.save({ id: fileId, file });
  }

  getFile(fileId: string): Promise<File | null> {
    return this.files.getAsFile(fileId);
  }
}
