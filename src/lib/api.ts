import { NextResponse } from "next/server";
import { z } from "zod";

import { TrustlessWorkApiError } from "@/lib/trustless-work/client";

export const evidenceSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum(["methodology", "photo", "dataset", "report", "receipt"]),
  title: z.string().min(1).max(160),
  url: z
    .string()
    .min(1)
    .refine((url) => isAllowedEvidenceUrl(url), "Evidence URL must use https:// or ipfs://"),
  submittedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

function isAllowedEvidenceUrl(url: string): boolean {
  if (url.startsWith("ipfs://")) return url.length > "ipfs://".length;
  if (!url.startsWith("https://")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

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
  const status = inferStatusFromMessage(message);
  return NextResponse.json({ error: message }, { status });
}

function inferStatusFromMessage(message: string): number {
  if (message.includes("not found") || message.includes("Not found")) return 404;
  if (
    message.includes("does not match") ||
    message.includes("exceeds remaining funding") ||
    message.includes("must be positive") ||
    message.includes("does not have an escrow contract") ||
    message.includes("missing") ||
    message.includes("expired")
  ) {
    return 400;
  }
  return 500;
}
