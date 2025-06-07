"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch("/api/openapi");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch OpenAPI spec: ${response.statusText}`,
          );
        }
        const data = await response.json();
        setSpec(data);
      } catch (err) {
        console.error("Error fetching OpenAPI spec:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load API documentation",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpec();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Loading API Documentation...
          </h2>
          <div className="animate-pulse h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading API Documentation
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>
      {spec && <SwaggerUI spec={spec} />}
    </div>
  );
}
