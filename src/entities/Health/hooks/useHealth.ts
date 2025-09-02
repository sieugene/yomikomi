"use client";

import { HealthResponse } from "@/infrastructure/api/types";
import { ApiClient } from "@/shared/api/api.client";
import { useEffect, useState } from "react";

export const useHealth = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const servicesIsActive = health?.services.database === "online";

  useEffect(() => {
    (async () => {
      const response = await ApiClient.getHealth();
      setHealth(response);
    })();
  }, []);
  return { health, servicesIsActive };
};
