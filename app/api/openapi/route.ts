import { NextResponse } from "next/server";
import { document } from "../openapi";

export async function GET() {
  return NextResponse.json(document, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
