// Main
export type ServiceStatus = "online" | "offline";
export type Services = "database";

// Health
export type HealthResponse = {
  status: number;
  services: {
    database: ServiceStatus;
  };
};


// API Response Types

export type ApiResponse = {
  Health: {
    GET: HealthResponse;
  };
};
