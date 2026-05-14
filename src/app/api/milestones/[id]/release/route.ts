import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { findExperimentBySlug } from "@/lib/experiments";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  experimentSlug: z.string().min(1),
  contractId: z.string().min(1),
  releaseSigner: z.string().min(1),
  milestoneIndex: z.union([z.number().int().min(0), z.string().min(1)]),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const input = await readJson(request, schema);
    if (!findExperimentBySlug(input.experimentSlug)) return ok({ error: "Experiment not found" }, { status: 404 });

    const result = await createTrustlessWorkClientFromEnv().releaseMilestone({
      contractId: input.contractId,
      releaseSigner: input.releaseSigner,
      milestoneIndex: String(input.milestoneIndex),
    });

    return ok({
      operation: "release_milestone",
      note: "Trustless Work docs say multi-release funds are released on approval; this route supports explicit release if needed.",
      milestoneId: params.id,
      experimentSlug: input.experimentSlug,
      unsignedTransaction: result.unsignedTransaction,
      raw: result.raw,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
