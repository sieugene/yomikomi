type EnvKeys =
  | "STORAGE_S3_REGION"
  | "STORAGE_S3_ENDPOINT"
  | "STORAGE_S3_CREDENTIALS_ACCESS_KEY"
  | "STORAGE_S3_CREDENTIALS_SECRET_KEY"
  | "STORAGE_S3_BUCKET";

class EnvConfig {
  private readonly env: Record<EnvKeys, string>;

  constructor() {
    this.env = {
      STORAGE_S3_CREDENTIALS_ACCESS_KEY:
        process.env.STORAGE_S3_CREDENTIALS_ACCESS_KEY || "",
      STORAGE_S3_CREDENTIALS_SECRET_KEY:
        process.env.STORAGE_S3_CREDENTIALS_SECRET_KEY || "",
      STORAGE_S3_ENDPOINT: process.env.STORAGE_S3_ENDPOINT || "",
      STORAGE_S3_REGION: process.env.STORAGE_S3_REGION || "",
      STORAGE_S3_BUCKET: process.env.STORAGE_S3_BUCKET || "",
    };
    this.validate();
  }

  private validate() {
    Object.entries(this.env).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
    });
  }

  public get(key: keyof typeof this.env): string {
    return this.env[key];
  }
}

export const ENV = new EnvConfig();
