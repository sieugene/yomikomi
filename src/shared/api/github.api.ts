interface DictionaryList {
  [key: string]: string;
}

class GitHubApi {
  private readonly DICT_LIST_URL =
    "https://raw.githubusercontent.com/sieugene/yomikomi-dictionaries/main/dict.list.json";

  private readonly PROXY_ENDPOINT = "/api/github-proxy";

  private async proxyFetch(url: string): Promise<Response> {
    const proxyUrl = `${this.PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`;
    return fetch(proxyUrl);
  }

  async getDictionaryList(): Promise<DictionaryList> {
    const response = await this.proxyFetch(this.DICT_LIST_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch dictionary list: ${response.status}`);
    }

    return await response.json();
  }

  async downloadDictionary(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<File> {
    // Convert GitHub blob URL to raw URL
    const rawUrl = url.replace("/blob/", "/raw/");

    const response = await this.proxyFetch(rawUrl);

    if (!response.ok) {
      throw new Error(`Failed to download dictionary: ${response.status}`);
    }

    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    if (!response.body) {
      throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (total > 0 && onProgress) {
        onProgress((loaded / total) * 100);
      }
    }

    const blob = new Blob(chunks as BlobPart[]);
    const filename = url.split("/").pop() || "dictionary.sqlite";

    return new File([blob], filename, { type: "application/x-sqlite3" });
  }
}

export const GitHubApiClient = new GitHubApi();
