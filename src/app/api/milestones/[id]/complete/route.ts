import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { findExperimentBySlug } from "@/lib/experiments";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  experimentSlug: z.string().min(1),
  contractId: z.string().min(1),
  signer: z.string().min(1),
  milestoneIndex: z.number().int().min(0),
  evidenceSummary: z.string().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const input = await readJson(request, schema);
    if (!findExperimentBySlug(input.experimentSlug)) return ok({ error: "Experiment not found" }, { status: 404 });

    const result = await createTrustlessWorkClientFromEnv().completeMilestone({
      contractId: input.contractId,
      signer: input.signer,
      milestoneIndex: input.milestoneIndex,
    });

    return ok({
      operation: "complete_milestone",
      milestoneId: params.id,
      experimentSlug: input.experimentSlug,
      unsignedTransaction: result.unsignedTransaction,
      raw: result.raw,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
