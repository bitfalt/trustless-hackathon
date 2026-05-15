import { z } from "zod";

import { errorResponse, ok } from "@/lib/api";
import { getExperiments } from "@/lib/experiments";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

const schema = z
  .object({
    contractIds: z.string().optional(),
    role: z.string().optional(),
    address: z.string().optional(),
    signer: z.string().optional(),
    type: z.string().optional(),
    validateOnChain: z.enum(["true", "false"]).optional(),
  })
  .refine((input) => input.contractIds || (input.role && input.address) || input.signer, {
    message: "Provide contractIds, role plus address, or signer.",
  });

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = schema.parse(Object.fromEntries(url.searchParams));
    const client = createTrustlessWorkClientFromEnv();
    const type = input.type ?? "multi-release";
    let escrows: unknown;

    if (input.contractIds) {
      const contractIds = input.contractIds
        .split(",")
        .map((contractId) => contractId.trim())
        .filter(Boolean);
      escrows = await client.getEscrowsByContractIds(contractIds, input.validateOnChain !== "false");
    } else if (input.signer) {
      escrows = await client.getEscrowsBySigner({ signer: input.signer, type });
    } else {
      escrows = await client.getEscrowsByRole({ role: input.role!, address: input.address!, type });
    }

    return ok({
      source: "trustless-work",
      type,
      escrows,
      localExperiments: getExperiments(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
