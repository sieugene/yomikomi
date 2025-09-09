import { BaseStoreManager } from "@/features/storage/model/BaseStoreManager";
import { OCRAlbumAlbum, OCRAlbumImage } from "../types";

const DB_NAME = "OCRAlbumDB";
const DB_VERSION = 1;
const ALBUMS_STORE = "albums";
const IMAGES_STORE = "images";
const FILES_STORE = "files";

interface StoredFile {
  id: string;
  file: string; // base64
  fileName: string;
  fileType: string;
  fileSize: number;
  lastAccessed: number;
}

const FileCodec = {
  async toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  },
  fromBase64(base64: string, name: string, type: string): File {
    const [, content] = base64.split(",");
    const binary = atob(content);
    const u8 = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new File([u8], name, { type });
  },
};

class FileStore extends BaseStoreManager<StoredFile> {
  async saveFile(id: string, file: File): Promise<string> {
    const stored: StoredFile = {
      id,
      file: await FileCodec.toBase64(file),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      lastAccessed: Date.now(),
    };
    return super.save(stored);
  }

  async getFile(id: string): Promise<File | null> {
    const data = await super.get(id);
    if (!data) return null;
    data.lastAccessed = Date.now();
    await super.save(data);
    return FileCodec.fromBase64(data.file, data.fileName, data.fileType);
  }

  async cleanupOldFiles(maxAgeMs = 5 * 24 * 60 * 60 * 1000): Promise<void> {
    const all = await this.list();
    const now = Date.now();
    await Promise.all(
      all
        .filter((f) => now - f.lastAccessed > maxAgeMs)
        .map((f) => this.delete(f.id))
    );
  }
}

class AlbumStore extends BaseStoreManager<OCRAlbumAlbum> {}
class ImageStore extends BaseStoreManager<OCRAlbumImage> {}

export class OCRAlbumIndexedDB {
  private albums = new AlbumStore(DB_NAME, ALBUMS_STORE);
  private images = new ImageStore(DB_NAME, IMAGES_STORE);
  private files = new FileStore(DB_NAME, FILES_STORE);
  private ready = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._initWithRetry();
    return this.initPromise;
  }

  private async _initWithRetry(retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this._initDatabase();
        this.ready = true;
        this.files.cleanupOldFiles().catch(console.error);
        return;
      } catch {
        if (i < retries - 1)
          await new Promise((r) => setTimeout(r, 2 ** i * 1000));
      }
    }
    throw new Error("Failed to initialize IndexedDB");
  }

  private async _initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      const timeout = setTimeout(
        () => reject(new Error("open timeout")),
        10000
      );

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
          const s = db.createObjectStore(ALBUMS_STORE, { keyPath: "id" });
          s.createIndex("name", "name");
          s.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains(IMAGES_STORE)) {
          const s = db.createObjectStore(IMAGES_STORE, { keyPath: "id" });
          s.createIndex("albumId", "albumId");
          s.createIndex("status", "status");
          s.createIndex("order", "order");
        }
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          db.createObjectStore(FILES_STORE, { keyPath: "id" });
        }
      };

      req.onsuccess = async () => {
        clearTimeout(timeout);
        await Promise.all([
          this.albums.init(),
          this.images.init(),
          this.files.init(),
        ]);
        resolve();
      };
      req.onerror = () => {
        clearTimeout(timeout);
        reject(req.error);
      };
      req.onblocked = () => {
        clearTimeout(timeout);
        reject(new Error("blocked"));
      };
    });
  }

  private ensureReady = () => (this.ready ? Promise.resolve() : this.init());

  // --- Albums ---
  async createAlbum(a: OCRAlbumAlbum) {
    await this.ensureReady();
    return this.albums.save(a);
  }
  async updateAlbum(a: OCRAlbumAlbum) {
    await this.ensureReady();
    return this.albums.save(a);
  }
  async getAlbum(id: string) {
    await this.ensureReady();
    return this.albums.get(id);
  }
  async getAllAlbums() {
    await this.ensureReady();
    return (await this.albums.list()).sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt)
    );
  }
  async deleteAlbum(id: string) {
    await this.ensureReady();
    const imgs = await this.getAlbumImages(id);
    await Promise.all(imgs.map((img) => this.files.delete(img.id)));
    await Promise.all(imgs.map((img) => this.images.delete(img.id)));
    await this.albums.delete(id);
  }

  // --- Images ---
  async createImage(img: OCRAlbumImage, file: File): Promise<string> {
    await this.ensureReady();
    await this.files.saveFile(img.id, file); // файл уходит в base64
    return this.images.save(img); // метаданные
  }

  async updateImage(img: OCRAlbumImage, file?: File): Promise<string> {
    await this.ensureReady();
    if (file) await this.files.saveFile(img.id, file);
    return this.images.save(img);
  }

  async getAlbumImages(albumId: string): Promise<OCRAlbumImage[]> {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.images.getDb()!.transaction(IMAGES_STORE, "readonly");
      const req = tx.objectStore(IMAGES_STORE).index("albumId").getAll(albumId);
      req.onsuccess = () =>
        resolve(req.result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      req.onerror = () => reject(req.error);
    });
  }

  async getImageFile(imageId: string): Promise<File | null> {
    await this.ensureReady();
    return this.files.getFile(imageId);
  }

  async getStorageInfo() {
    const info = { isSupported: "indexedDB" in window };
    try {
      if (navigator.storage?.estimate) {
        const e = await navigator.storage.estimate();
        return { ...info, estimatedUsage: e.usage, estimatedQuota: e.quota };
      }
    } catch {}
    return info;
  }

  async performMaintenance() {
    await this.ensureReady();
    await this.files.cleanupOldFiles();
  }
}
