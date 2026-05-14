import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { findExperimentBySlug } from "@/lib/experiments";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

const schema = z.object({
  experimentSlug: z.string().min(1),
  contractId: z.string().min(1),
  signer: z.string().min(1),
  amount: z.union([z.number().positive(), z.string().min(1)]).optional(),
});

export async function POST(request: Request) {
  try {
    const input = await readJson(request, schema);
    const experiment = findExperimentBySlug(input.experimentSlug);
    if (!experiment) return ok({ error: "Experiment not found" }, { status: 404 });

    const amount = String(input.amount ?? experiment.fundingGoal);
    const result = await createTrustlessWorkClientFromEnv().fundEscrow({
      contractId: input.contractId,
      signer: input.signer,
      amount,
    });

    return ok({
      operation: "fund_escrow",
      experimentSlug: input.experimentSlug,
      contractId: input.contractId,
      amount,
      unsignedTransaction: result.unsignedTransaction,
      raw: result.raw,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
