import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { assertExperimentRole, validateMilestoneOperation } from "@/lib/experiments";
import { createPendingTransaction } from "@/lib/pending-transactions";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  experimentSlug: z.string().min(1),
  contractId: z.string().min(1),
  signer: z.string().min(1),
  walletAddress: z.string().min(1),
  milestoneIndex: z.number().int().min(0),
  evidenceSummary: z.string().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const input = await readJson(request, schema);
    const { experiment, milestoneIndex } = validateMilestoneOperation({
      experimentSlug: input.experimentSlug,
      milestoneId: params.id,
      milestoneIndex: input.milestoneIndex,
      contractId: input.contractId,
    });
    assertExperimentRole(experiment, input.walletAddress, "serviceProvider");
    if (input.walletAddress.toUpperCase() !== input.signer.toUpperCase()) {
      return ok({ error: "Signer must match the connected service provider wallet" }, { status: 403 });
    }

    const result = await createTrustlessWorkClientFromEnv().completeMilestone({
      contractId: input.contractId,
      signer: input.signer,
      milestoneIndex,
    });
    const pendingTransaction = createPendingTransaction({
      operation: "complete_milestone",
      experimentSlug: input.experimentSlug,
      contractId: input.contractId,
      milestoneId: params.id,
      milestoneIndex,
    });

    return ok({
      operation: "complete_milestone",
      milestoneId: params.id,
      experimentSlug: input.experimentSlug,
      pendingTransactionId: pendingTransaction.id,
      pendingTransactionExpiresAt: pendingTransaction.expiresAt,
      unsignedTransaction: result.unsignedTransaction,
      raw: result.raw,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
