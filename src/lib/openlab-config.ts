import type { InitializeMultiReleaseEscrowInput, Trustline } from "@/lib/trustless-work/types";

export type CreateEscrowConfigInput = {
  experimentSlug: string;
  signer: string;
  serviceProvider: string;
  approver: string;
  platformAddress?: string;
  releaseSigner?: string;
  disputeResolver?: string;
  trustline?: Trustline;
  platformFee?: number;
};

export function resolveCreateEscrowConfig(input: CreateEscrowConfigInput): CreateEscrowConfigInput & InitializeMultiReleaseEscrowInput {
  const platformAddress = input.platformAddress ?? input.signer;
  const releaseSigner = input.releaseSigner ?? input.approver;
  const disputeResolver = input.disputeResolver ?? input.approver;
  const trustline = input.trustline ?? {
    address: defaultUsdcTrustlineAddress(),
    symbol: "USDC",
  };

  return {
    ...input,
    platformAddress,
    releaseSigner,
    disputeResolver,
    trustline,
  };
}

function defaultUsdcTrustlineAddress(): string {
  return "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
}
