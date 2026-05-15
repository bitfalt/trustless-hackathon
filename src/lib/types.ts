export type ExperimentStatus = "draft" | "funding" | "funded" | "in_progress" | "completed";

export type MilestoneStatus =
  | "locked"
  | "ready_for_review"
  | "approved"
  | "released"
  | "disputed";

export type ExperimentCategory = "Water" | "Air" | "Mobility" | "Education" | "Health";

export type EvidenceType = "methodology" | "photo" | "dataset" | "report" | "receipt";

export type Evidence = {
  id: string;
  type: EvidenceType;
  title: string;
  url: string;
  submittedAt: string;
  notes?: string;
};

export type Milestone = {
  id: string;
  index: number;
  title: string;
  description: string;
  releasePercent: number;
  amount: number;
  receiver?: string;
  status: MilestoneStatus;
  deliverables: string[];
  evidence: Evidence[];
  trustlessWorkStatus?: string;
  lastTransactionHash?: string;
};

export type EscrowMetadata = {
  type: "multi-release";
  contractId?: string;
  engagementId: string;
  viewerUrl?: string;
  createdTransactionHash?: string;
  fundedTransactionHash?: string;
  balance?: number;
  serviceProviderWallet?: string;
  approverWallet?: string;
  releaseSignerWallet?: string;
  platformWallet?: string;
  disputeResolverWallet?: string;
  lastOperation?: string;
  lastTransactionHash?: string;
  network: "testnet" | "mainnet";
  mode: "real";
};

export type Experiment = {
  id: string;
  title: string;
  slug: string;
  location: string;
  category: ExperimentCategory;
  summary: string;
  problem: string;
  methodology: string;
  fundingGoal: number;
  fundedAmount: number;
  currency: "USDC";
  status: ExperimentStatus;
  escrowType: "multi-release";
  creatorWallet?: string;
  escrowContractId?: string;
  escrowViewerUrl?: string;
  escrow: EscrowMetadata;
  team: {
    name: string;
    type: "school" | "community" | "student" | "researcher" | "civic-team";
    walletAddress?: string;
  };
  verifier: {
    name: string;
    role: string;
    walletAddress?: string;
  };
  disputeResolver?: {
    name: string;
    walletAddress?: string;
  };
  milestones: Milestone[];
  results?: {
    datasetUrl?: string;
    reportUrl?: string;
    chartData: Array<{ label: string; value: number }>;
    summary: string;
  };
};

export type ApiErrorBody = {
  error: string;
  details?: Record<string, unknown>;
};
