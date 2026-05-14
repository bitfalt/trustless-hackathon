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
  const platformAddress = input.platformAddress ?? requiredEnv("OPENLAB_PLATFORM_ADDRESS");
  const releaseSigner = input.releaseSigner ?? process.env.OPENLAB_RELEASE_SIGNER_ADDRESS ?? input.approver;
  const disputeResolver = input.disputeResolver ?? requiredEnv("OPENLAB_DISPUTE_RESOLVER_ADDRESS");
  const trustline = input.trustline ?? {
    address: requiredEnv("OPENLAB_USDC_TRUSTLINE_ADDRESS"),
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

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required when the create escrow request does not provide an explicit value`);
  }
  return value;
}
