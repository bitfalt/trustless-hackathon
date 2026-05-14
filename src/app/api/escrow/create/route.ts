import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { findExperimentBySlug } from "@/lib/experiments";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";
import { createPendingTransaction } from "@/lib/pending-transactions";
import { buildInitializeMultiReleaseEscrowPayload } from "@/lib/trustless-work/openlab-mapper";

const schema = z.object({
  experimentSlug: z.string().min(1),
  signer: z.string().min(1),
  serviceProvider: z.string().min(1),
  approver: z.string().min(1),
  platformAddress: z.string().min(1),
  releaseSigner: z.string().min(1),
  disputeResolver: z.string().min(1),
  trustline: z.object({
    address: z.string().min(1),
    symbol: z.string().min(1).default("USDC"),
  }),
  platformFee: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const input = await readJson(request, schema);
    const experiment = findExperimentBySlug(input.experimentSlug);
    if (!experiment) return ok({ error: "Experiment not found" }, { status: 404 });

    const payload = buildInitializeMultiReleaseEscrowPayload(experiment, input);
    const result = await createTrustlessWorkClientFromEnv().initializeMultiReleaseEscrow(payload);
    const pendingTransaction = createPendingTransaction({
      operation: "create_escrow",
      experimentSlug: input.experimentSlug,
    });

    return ok({
      operation: "create_escrow",
      experimentSlug: input.experimentSlug,
      pendingTransactionId: pendingTransaction.id,
      pendingTransactionExpiresAt: pendingTransaction.expiresAt,
      payload,
      unsignedTransaction: result.unsignedTransaction,
      raw: result.raw,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
