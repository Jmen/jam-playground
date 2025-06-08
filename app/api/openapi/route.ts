import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const revalidate = 999999;

export async function GET() {
  const openApiPath = path.join(process.cwd(), "public", "openapi.json");

  // Check if the static file exists
  if (fs.existsSync(openApiPath)) {
    const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, "utf-8"));
    return NextResponse.json(openApiSpec, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return NextResponse.json(
      { error: "OpenAPI spec not found" },
      { status: 404 },
    );
  }
}
