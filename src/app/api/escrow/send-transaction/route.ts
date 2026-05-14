import { z } from "zod";

import { errorResponse, ok, readJson } from "@/lib/api";
import {
  approveMilestoneLocally,
  attachEscrowCreation,
  attachEscrowFunding,
  markMilestoneCompleteLocally,
  releaseMilestoneLocally,
} from "@/lib/experiments";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

const schema = z.object({
  signedXdr: z.string().min(1),
  experimentSlug: z.string().optional(),
  operation: z.enum(["create_escrow", "fund_escrow", "complete_milestone", "approve_milestone", "release_milestone"]).optional(),
  milestoneId: z.string().optional(),
  expectedContractId: z.string().optional(),
  amount: z.number().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const input = await readJson(request, schema);
    const tx = await createTrustlessWorkClientFromEnv().sendTransaction({ signedXdr: input.signedXdr });
    const transactionHash = tx.transactionHash;
    const contractId = tx.contractId ?? input.expectedContractId;
    let experiment = undefined;

    if (input.experimentSlug && input.operation === "create_escrow" && contractId) {
      experiment = attachEscrowCreation(input.experimentSlug, contractId, transactionHash);
    }

    if (input.experimentSlug && input.operation === "fund_escrow") {
      experiment = attachEscrowFunding(input.experimentSlug, input.amount ?? 0, transactionHash);
    }

    if (input.experimentSlug && input.operation === "complete_milestone" && input.milestoneId) {
      experiment = markMilestoneCompleteLocally(input.experimentSlug, input.milestoneId, transactionHash);
    }

    if (input.experimentSlug && input.operation === "approve_milestone" && input.milestoneId) {
      experiment = approveMilestoneLocally(input.experimentSlug, input.milestoneId, transactionHash);
    }

    if (input.experimentSlug && input.operation === "release_milestone" && input.milestoneId) {
      experiment = releaseMilestoneLocally(input.experimentSlug, input.milestoneId, transactionHash);
    }

    return ok({
      operation: input.operation,
      transaction: tx,
      experiment,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
