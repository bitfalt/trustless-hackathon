import { errorResponse, ok } from "@/lib/api";
import { createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";

type RouteContext = { params: Promise<{ contractId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const url = new URL(request.url);
    const validateOnChain = url.searchParams.get("validateOnChain") !== "false";
    const escrow = await createTrustlessWorkClientFromEnv().getEscrowsByContractIds([params.contractId], validateOnChain);

    return ok({
      contractId: params.contractId,
      validateOnChain,
      escrow,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
