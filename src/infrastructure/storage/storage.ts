import { ENV } from "@/shared/env";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

class Storage {
  public client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: ENV.get("STORAGE_S3_REGION"),
      endpoint: ENV.get("STORAGE_S3_ENDPOINT"), // MinIO
      credentials: {
        accessKeyId: ENV.get("STORAGE_S3_CREDENTIALS_ACCESS_KEY"),
        secretAccessKey: ENV.get("STORAGE_S3_CREDENTIALS_SECRET_KEY"),
      },
      forcePathStyle: true, // MinIO
    });
  }
  upload(input: Omit<PutObjectCommandInput, "Bucket">) {
    return this.client.send(
      new PutObjectCommand({
        Bucket: ENV.get("STORAGE_S3_BUCKET"),
        ...input,
      })
    );
  }

  async checkBucketHealth() {
    await this.client.send(
      new HeadBucketCommand({ Bucket: ENV.get("STORAGE_S3_BUCKET") })
    );
  }
}

export const StorageService = new Storage();
