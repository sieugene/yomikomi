import { HealthCase } from "@/application/cases/health/health-case";
import { ApiResponse } from "@/infrastructure/api/types";
import { NextResponse } from "next/server";

async function get(): Promise<
  NextResponse<ApiResponse["Health"]["GET"] | { error: string }>
> {
  const healthCase = new HealthCase();
  const { services, status } = await healthCase.check();

  return NextResponse.json({
    status: status === "ok" ? 200 : 500,
    services,
  });
}

export const API_HEALTH = {
  GET: get,
};
