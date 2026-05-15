import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { validateMilestoneOperation } from "@/lib/experiments";
import { createPendingTransaction } from "@/lib/pending-transactions";
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
    const { milestoneIndex } = validateMilestoneOperation({
      experimentSlug: input.experimentSlug,
      milestoneId: params.id,
      milestoneIndex: input.milestoneIndex,
      contractId: input.contractId,
    });

    const result = await createTrustlessWorkClientFromEnv().releaseMilestone({
      contractId: input.contractId,
      releaseSigner: input.releaseSigner,
      milestoneIndex: String(milestoneIndex),
    });
    const pendingTransaction = createPendingTransaction({
      operation: "release_milestone",
      experimentSlug: input.experimentSlug,
      contractId: input.contractId,
      milestoneId: params.id,
      milestoneIndex,
    });

    return ok({
      operation: "release_milestone",
      note: "Trustless Work multi-release milestone funds are released through release-milestone-funds.",
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
