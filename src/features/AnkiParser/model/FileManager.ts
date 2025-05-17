export interface StoredFile {
  key: string;
  name: string;
  type: string;
  content: Blob;
  id: number;
}

export interface FileUrl {
  url: string;
  name: string;
}

export default class FileManager {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private objectUrls: Map<string | number, string> = new Map();

  constructor(dbName = "FileManagerDB", storeName = "files") {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: "key", // используем ключ "key" из StoredFile
            autoIncrement: false,
          });
        }
      };

      request.onsuccess = (event) =>
        resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
    });
  }

  async saveFile(
    file: File | Blob,
    fileKey: string,
    name?: string
  ): Promise<string> {
    if (!this.db) await this.init();

    const fileName = name || (file instanceof File ? file.name : "blob");
    const fileType =
      file instanceof File ? file.type : "application/octet-stream";

    const data: Omit<StoredFile, "id"> = {
      key: fileKey,
      name: fileName,
      type: fileType,
      content: file,
    };

    return new Promise<string>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(fileKey);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async getFileUrl(itemKey: string): Promise<FileUrl> {
    if (!this.db) await this.init();
    const key = await this.getKeyByItemKey(itemKey);

    return new Promise<FileUrl>((resolve, reject) => {
      if (!key) {
        reject(new Error("No has key"));
        return;
      }
      const tx = this.db!.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (event) => {
        const file = (event.target as IDBRequest).result as
          | StoredFile
          | undefined;
        if (file) {
          if (this.objectUrls.has(key)) {
            resolve({ url: this.objectUrls.get(key)!, name: file.name });
            return;
          }

          const url = URL.createObjectURL(file.content);
          this.objectUrls.set(key, url);
          resolve({ url, name: file.name });
        } else {
          reject(new Error("File not found"));
        }
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  revokeFileUrl(key: string): void {
    const url = this.objectUrls.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(key);
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.db) await this.init();

    this.revokeFileUrl(key);

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async listFiles(): Promise<StoredFile[]> {
    if (!this.db) await this.init();

    return new Promise<StoredFile[]>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest).result as StoredFile[]);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async hasFile(itemKey: string): Promise<boolean> {
    if (!this.db) await this.init();
    const key = await this.getKeyByItemKey(itemKey);
    if (!key) {
      return false;
    }

    return new Promise<boolean>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.getKey(key);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result !== undefined);
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async getKeyByItemKey(itemKey: string) {
    if (!this.db) await this.init();
    const allFiles = await this.listFiles();
    const current = allFiles.find((a) => a.key === itemKey);
    return current?.id;
  }
}
