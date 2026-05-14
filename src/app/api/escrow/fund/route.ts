import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import { findExperimentBySlug } from "@/lib/experiments";
import { createPendingTransaction } from "@/lib/pending-transactions";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

const schema = z.object({
  experimentSlug: z.string().min(1),
  contractId: z.string().min(1),
  signer: z.string().min(1),
  amount: z.union([z.number().positive(), z.string().min(1)]),
});

export async function POST(request: Request) {
  try {
    const input = await readJson(request, schema);
    const experiment = findExperimentBySlug(input.experimentSlug);
    if (!experiment) return ok({ error: "Experiment not found" }, { status: 404 });

    const amount = String(input.amount);
    const amountNumber = Number(input.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return ok({ error: "Funding amount must be a positive number" }, { status: 400 });
    }
    const remaining = experiment.fundingGoal - experiment.fundedAmount;
    if (amountNumber > remaining) {
      return ok({ error: `Funding amount ${amountNumber} exceeds remaining funding ${remaining}` }, { status: 400 });
    }
    const storedContractId = experiment.escrow.contractId ?? experiment.escrowContractId;
    if (!storedContractId) {
      return ok({ error: `Experiment ${input.experimentSlug} does not have an escrow contract yet` }, { status: 400 });
    }
    if (storedContractId !== input.contractId) {
      return ok({ error: `Contract ID ${input.contractId} does not match experiment escrow contract ${storedContractId}` }, { status: 400 });
    }

    const result = await createTrustlessWorkClientFromEnv().fundEscrow({
      contractId: input.contractId,
      signer: input.signer,
      amount,
    });
    const pendingTransaction = createPendingTransaction({
      operation: "fund_escrow",
      experimentSlug: input.experimentSlug,
      contractId: input.contractId,
      amount: amountNumber,
    });

    return ok({
      operation: "fund_escrow",
      experimentSlug: input.experimentSlug,
      pendingTransactionId: pendingTransaction.id,
      pendingTransactionExpiresAt: pendingTransaction.expiresAt,
      contractId: input.contractId,
      amount,
      unsignedTransaction: result.unsignedTransaction,
      raw: result.raw,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
