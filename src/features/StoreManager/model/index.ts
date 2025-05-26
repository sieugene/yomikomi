export abstract class BaseStoreManager<T> {
  protected db: IDBDatabase | null = null;
  protected dbName: string;
  protected storeName: string;

  constructor(dbName: string, storeName: string) {
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
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };

      request.onsuccess = (event) =>
        resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
    });
  }

  async save(data: T): Promise<string> {
    if (!this.db) await this.init();

    return new Promise<string>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () =>
        resolve((data as unknown as { key: string }).key);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async get(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise<T | null>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest).result ?? null);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async getAsFile(key: string): Promise<File | null> {
    const data = await this.get(key);
    if (!data) return null;
    return this.asFile(data);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  protected asFile(data: T): File | null {
    return null;
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async list(): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise<T[]>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest).result as T[]);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async has(key: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise<boolean>((resolve, reject) => {
      const tx = this.db!.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.getKey(key);

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest).result !== undefined);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }
}
