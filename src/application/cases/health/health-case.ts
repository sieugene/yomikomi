import { Services, ServiceStatus } from "@/infrastructure/api/types";
import { prisma } from "@/infrastructure/database/prisma";
import { StorageService } from "@/infrastructure/storage/storage";

export class HealthCase {
  private services: Record<Services, ServiceStatus>;
  constructor() {
    this.services = {
      database: "offline",
      minio: "offline",
    };
  }
  async check(): Promise<{
    services: Record<Services, ServiceStatus>;
    status: "ok" | "error";
  }> {
    try {
      await this.checkDatabase();
      this.services.database = "online";
    } catch {
      console.error("Database health check error");
      this.services.database = "offline";
    }

    try {
      await this.checkMinio();
      this.services.minio = "online";
    } catch {
      console.error("MinIO health check error");
      this.services.minio = "offline";
    }

    return {
      services: this.services,
      status: Object.values(this.services).includes("offline") ? "error" : "ok",
    };
  }

  private async checkDatabase() {
    await prisma.$queryRaw`SELECT 1`;
  }

  private async checkMinio() {
    await StorageService.checkBucketHealth();
  }
}
