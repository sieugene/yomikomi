import { BaseStoreManager } from "../../../storage/model/BaseStoreManager";

export interface StoredFile {
  key: string;
  name: string;
  type: string;
  content: Blob;
}

export interface FileUrl {
  url: string;
  name: string;
}

export class FileStoreManager extends BaseStoreManager<StoredFile> {
  private objectUrls = new Map<string, string>();

  constructor(dbName = "FileManagerDB") {
    super(dbName, "files");
  }

  async saveFile(
    file: File | Blob,
    key: string,
    name?: string
  ): Promise<string> {
    const stored: StoredFile = {
      key,
      name: name ?? (file instanceof File ? file.name : "blob"),
      type: file instanceof File ? file.type : "application/octet-stream",
      content: file,
    };
    return this.save(stored);
  }

  async getFileUrl(key: string): Promise<FileUrl> {
    const file = await this.get(key);
    if (!file) throw new Error("File not found");

    if (!this.objectUrls.has(key)) {
      const url = URL.createObjectURL(file.content);
      this.objectUrls.set(key, url);
    }

    return { url: this.objectUrls.get(key)!, name: file.name };
  }

  revokeFileUrl(key: string) {
    const url = this.objectUrls.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(key);
    }
  }

  protected asFile(data: StoredFile): File | null {
    try {
      return new File([data.content], data.name, { type: data.type });
    } catch {
      return null;
    }
  }
}
