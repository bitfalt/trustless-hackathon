import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import {
  approveMilestoneLocally,
  attachEscrowCreation,
  attachEscrowFunding,
  markMilestoneCompleteLocally,
  releaseMilestoneLocally,
} from "@/lib/experiments";
import { consumePendingTransaction, getPendingTransaction } from "@/lib/pending-transactions";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

const schema = z.object({
  signedXdr: z.string().min(1),
  pendingTransactionId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = await readJson(request, schema);
    const pending = getPendingTransaction(input.pendingTransactionId);
    if (!pending) {
      return ok({ error: "Pending transaction not found, expired, or already consumed" }, { status: 400 });
    }

    const client = createTrustlessWorkClientFromEnv();
    const tx = await client.sendTransaction({ signedXdr: input.signedXdr });
    const transactionHash = tx.transactionHash;
    const canonicalUpdate = transactionHash
      ? await client.updateFromTransactionHash({ txHash: transactionHash }).catch((error) => ({
          error: error instanceof Error ? error.message : "Failed to refresh Trustless Work indexer state",
        }))
      : undefined;
    let experiment = undefined;

    if (pending.operation === "create_escrow") {
      const contractId = tx.contractId ?? demoContractIdForCreate(pending.id, tx.status);
      if (!contractId) {
        return ok(
          {
            error:
              "Trustless Work did not return a contract ID for the create escrow transaction. Sync the escrow before updating local state.",
            transaction: tx,
          },
          { status: 502 },
        );
      }
      experiment = attachEscrowCreation(
        pending.experimentSlug,
        contractId,
        transactionHash,
        escrowModeForSubmittedTransaction(tx.status),
        pending.roles,
      );
    }

    if (pending.operation === "fund_escrow") {
      if (!pending.amount) return ok({ error: "Pending fund transaction is missing amount" }, { status: 400 });
      experiment = attachEscrowFunding(pending.experimentSlug, pending.amount, transactionHash);
    }

    if (pending.operation === "complete_milestone") {
      if (!pending.milestoneId) return ok({ error: "Pending complete transaction is missing milestone ID" }, { status: 400 });
      experiment = markMilestoneCompleteLocally(pending.experimentSlug, pending.milestoneId, transactionHash);
    }

    if (pending.operation === "approve_milestone") {
      if (!pending.milestoneId) return ok({ error: "Pending approve transaction is missing milestone ID" }, { status: 400 });
      experiment = approveMilestoneLocally(pending.experimentSlug, pending.milestoneId, transactionHash);
    }

    if (pending.operation === "release_milestone") {
      if (!pending.milestoneId) return ok({ error: "Pending release transaction is missing milestone ID" }, { status: 400 });
      experiment = releaseMilestoneLocally(pending.experimentSlug, pending.milestoneId, transactionHash);
    }

    consumePendingTransaction(input.pendingTransactionId);

    return ok({
      operation: pending.operation,
      pendingTransactionId: pending.id,
      transaction: tx,
      canonicalUpdate,
      experiment,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function escrowModeForSubmittedTransaction(status?: string): "real" | "demo" {
  if (status === "demo_submitted") return "demo";
  if (process.env.TRUSTLESS_WORK_API_KEY && process.env.OPENLAB_ESCROW_MODE !== "demo") return "real";
  return "demo";
}

function demoContractIdForCreate(pendingTransactionId: string, status?: string): string | undefined {
  const isDemoSubmission =
    process.env.OPENLAB_ESCROW_MODE === "demo" ||
    (process.env.NODE_ENV !== "production" &&
      !process.env.TRUSTLESS_WORK_API_KEY &&
      process.env.OPENLAB_DISABLE_DEMO_FALLBACK !== "true") ||
    status === "demo_submitted";
  if (!isDemoSubmission) return undefined;
  return `demo_contract_${pendingTransactionId.replace(/^ptx_/, "")}`;
}
