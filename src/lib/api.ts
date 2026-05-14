import { NextResponse } from "next/server";
import { z } from "zod";

import { TrustlessWorkApiError } from "@/lib/trustless-work/client";

export const evidenceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["methodology", "photo", "dataset", "report", "receipt"]),
  title: z.string().min(1),
  url: z.string().url(),
  submittedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function readJson<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const body = await request.json().catch(() => undefined);
  return schema.parse(body);
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request payload",
        details: error.flatten(),
      },
      { status: 400 },
    );
  }

  if (error instanceof TrustlessWorkApiError) {
    console.error("Trustless Work provider error", error.providerError);
    return NextResponse.json({ error: error.message }, { status: error.status >= 500 ? 502 : error.status });
  }

  const message = error instanceof Error ? error.message : "Unexpected backend error";
  const status = message.includes("not found") || message.includes("Not found") ? 404 : 500;
  return NextResponse.json({ error: message }, { status });
}
