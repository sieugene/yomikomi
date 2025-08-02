import { Services, ServiceStatus } from "@/infrastructure/api/types";
import { prisma } from "@/infrastructure/database/prisma";

export class HealthCase {
  private services: Record<Services, ServiceStatus>;
  constructor() {
    this.services = {
      database: "offline",
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

    return {
      services: this.services,
      status: Object.values(this.services).includes("offline") ? "error" : "ok",
    };
  }

  private async checkDatabase() {
    await prisma.$queryRaw`SELECT 1`;
  }
}
