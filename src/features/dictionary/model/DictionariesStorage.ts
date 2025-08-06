import { BaseStoreManager } from "@/features/storage/model/BaseStoreManager";
import { v4 as uuidv4 } from "uuid";

export interface StoredFile {
  key: string;
  name: string;
  type: string;
  content: Blob;
}

// DictionariesStorage
class StorageDb extends BaseStoreManager<StoredFile> {
  constructor(dbName = "DictionariesStorage") {
    super(dbName, "files");
  }
}

const INIT_JSON_STRUCTURE = `
{
  "data": []
}
`;

export type DictionariesStorageState = {
  data: {
    name: string;
    id: string;
  }[];
};


// TODO same with CollectionStore
export class DictionariesStorage {
  private STORE_KEY = "FILES_LIST";
  public storeManager: StorageDb;
  private state: DictionariesStorageState = {
    data: [],
  };
  constructor(
    private readonly subcribe?: (state: DictionariesStorageState) => void
  ) {
    this.storeManager = new StorageDb();
  }

  public async init() {
    const storeExist = await this.storeManager.has(this.STORE_KEY);

    // Init Store
    if (!storeExist) {
      await this.sync();
    } else {
      // Sync cached
      const listFile = await this.storeManager.get(this.STORE_KEY);
      const text = await listFile?.content.text();
      this.state = JSON.parse(text || INIT_JSON_STRUCTURE);
      await this.sync();
    }
  }

  public async add(file: File) {
    const uuid = uuidv4();
    const name = file?.name || "unkown file";
    const stored: StoredFile = {
      key: uuid,
      name: name ?? (file instanceof File ? file.name : "blob"),
      type: file instanceof File ? file.type : "application/octet-stream",
      content: file,
    };
    await this.storeManager.save(stored);
    this.state.data.push({
      id: uuid,
      name,
    });
    await this.sync();
  }

  public getState() {
    return this.state;
  }
  public getStoreManager() {
    return this.storeManager;
  }

  private async sync() {
    await this.storeManager.save({
      content: new Blob([JSON.stringify(this.state)], {
        type: "application/json",
      }),
      key: this.STORE_KEY,
      name: this.STORE_KEY,
      type: "application/json",
    });

    this.subcribe?.(this.state);
  }
}
