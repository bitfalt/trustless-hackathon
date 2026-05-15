export type Trustline = {
  address: string;
  symbol: "USDC" | "EURC" | string;
};

export type InitializeMultiReleaseEscrowPayload = {
  signer: string;
  engagementId: string;
  title: string;
  description: string;
  roles: {
    approver: string;
    serviceProvider: string;
    platformAddress: string;
    releaseSigner: string;
    disputeResolver: string;
  };
  platformFee: number;
  milestones: Array<{
    description: string;
    amount: number;
    receiver: string;
  }>;
  trustline: Trustline;
};

export type InitializeMultiReleaseEscrowInput = {
  signer: string;
  serviceProvider: string;
  approver: string;
  platformAddress: string;
  releaseSigner: string;
  disputeResolver: string;
  trustline: Trustline;
  platformFee?: number;
};

export type FundEscrowPayload = {
  contractId: string;
  signer: string;
  amount: number;
};

export type CompleteMilestonePayload = {
  contractId: string;
  signer: string;
  milestoneIndex: number;
};

export type ChangeMilestoneStatusPayload = {
  contractId: string;
  milestoneIndex: string;
  newStatus: string;
  newEvidence: string;
  serviceProvider: string;
};

export type ApproveMilestonePayload = {
  contractId: string;
  milestoneIndex: string;
  approver: string;
};

export type ReleaseMilestonePayload = {
  contractId: string;
  milestoneIndex: string;
  releaseSigner: string;
};

export type GetEscrowsByRoleParams = {
  role: string;
  address: string;
  type?: "single-release" | "multi-release" | string;
};

export type GetEscrowsBySignerParams = {
  signer: string;
  type?: "single-release" | "multi-release" | string;
};

export type UpdateFromTransactionHashPayload = {
  txHash: string;
};

export type SendTransactionPayload = {
  signedXdr: string;
};

export type UnsignedTransactionResponse = {
  unsignedTransaction: string;
  raw: unknown;
};

export type SendTransactionResponse = {
  transactionHash?: string;
  contractId?: string;
  status?: string;
  raw: unknown;
};

export type TrustlessWorkClientOptions = {
  apiBaseUrl: string;
  apiKey?: string;
  fetcher?: typeof fetch;
  demoMode?: boolean;
};
