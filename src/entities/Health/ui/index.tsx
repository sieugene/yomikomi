"use client";
import React from "react";
import { useHealth } from "../hooks/useHealth";
import { ServiceStatus } from "@/infrastructure/api/types";

export const Health = () => {
  const { health } = useHealth();
  const getStatusIndicator = (serviceName: string, status: ServiceStatus) => {
    const isActive = status === "online";
    return (
      <div className="flex items-center gap-2 py-2">
        <span className={isActive ? "text-green-500" : "text-red-500"}>
          {isActive ? "●" : "●"}
        </span>
        <span className="text-lg font-medium text-gray-700">{serviceName}</span>
      </div>
    );
  };

  if (!health) {
    return (
      <div className="w-full max-w-md p-4 rounded-2xl shadow-lg bg-white">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Service Status
        </h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-4 rounded-2xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Service Status</h2>
      {getStatusIndicator("Database", health.services.database)}
      {getStatusIndicator("Minio", health.services.minio)}
    </div>
  );
};
