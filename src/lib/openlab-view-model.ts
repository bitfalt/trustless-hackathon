import type { Experiment } from "@/lib/types";

export type ProjectCardView = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  metrics: string;
  image: string;
  artist: string;
  location: string;
  medium: string;
  article: string;
  currency: "USDC";
  fundingGoal: number;
  fundedAmount: number;
  escrowContractId?: string;
  escrowViewerUrl?: string;
  escrowMode: "real";
  escrowBalance?: number;
  creatorWallet?: string;
  roles: {
    serviceProvider?: string;
    approver?: string;
    releaseSigner?: string;
    platform?: string;
    disputeResolver?: string;
  };
  milestones: Array<{
    id: string;
    index: number;
    title: string;
    amount: number;
    status: string;
    evidenceCount: number;
    evidence: Array<{
      id: string;
      type: "methodology" | "photo" | "dataset" | "report" | "receipt";
      title: string;
      url: string;
      submittedAt?: string;
      notes?: string;
    }>;
    lastTransactionHash?: string;
  }>;
};

const imageByCategory: Record<string, string> = {
  Water: "/images/project-water-costa-rica.jpg",
  Air: "/images/project-air-quality.jpg",
  Mobility: "/images/project-weather-station.jpg",
  Education: "/images/project-solar-school.jpg",
  Health: "/images/project-soil-health.jpg",
};

export function experimentToProjectCard(experiment: Experiment): ProjectCardView {
  const milestoneSummary =
    experiment.milestones.length > 0
      ? experiment.milestones
          .map((milestone) => `${milestone.index + 1}. ${milestone.title} (${milestone.amount} ${experiment.currency})`)
          .join("\n")
      : "Milestones will be published when this experiment opens for funding.";

  return {
    id: experiment.id,
    slug: experiment.slug,
    title: experiment.title,
    type: experiment.category.toLowerCase(),
    status: experiment.status.toUpperCase().replaceAll("_", " "),
    metrics: `${experiment.fundedAmount}/${experiment.fundingGoal} ${experiment.currency}`,
    image: experiment.imageUrl ?? imageByCategory[experiment.category] ?? "/images/project-biodiversity.jpg",
    artist: experiment.team.name,
    location: experiment.location,
    medium: experiment.methodology,
    article: `${experiment.summary}\n\n${experiment.problem}\n\n${experiment.methodology}\n\nMilestones:\n${milestoneSummary}`,
    currency: experiment.currency,
    fundingGoal: experiment.fundingGoal,
    fundedAmount: experiment.fundedAmount,
    escrowContractId: experiment.escrow.contractId ?? experiment.escrowContractId,
    escrowViewerUrl: experiment.escrow.viewerUrl ?? experiment.escrowViewerUrl,
    escrowMode: experiment.escrow.mode,
    escrowBalance: experiment.escrow.balance,
    creatorWallet: experiment.creatorWallet,
    roles: {
      serviceProvider: experiment.escrow.serviceProviderWallet ?? experiment.team.walletAddress ?? experiment.creatorWallet,
      approver: experiment.escrow.approverWallet ?? experiment.verifier.walletAddress,
      releaseSigner: experiment.escrow.releaseSignerWallet,
      platform: experiment.escrow.platformWallet,
      disputeResolver: experiment.escrow.disputeResolverWallet ?? experiment.disputeResolver?.walletAddress,
    },
    milestones: experiment.milestones.map((milestone) => ({
      id: milestone.id,
      index: milestone.index,
      title: milestone.title,
      amount: milestone.amount,
      status: milestone.status,
      evidenceCount: milestone.evidence.length,
      evidence: milestone.evidence.map((evidence) => ({
        id: evidence.id,
        type: evidence.type,
        title: evidence.title,
        url: evidence.url,
        submittedAt: evidence.submittedAt,
        notes: evidence.notes,
      })),
      lastTransactionHash: milestone.lastTransactionHash,
    })),
  };
}

export function experimentsToProjectCards(experiments: Experiment[]): ProjectCardView[] {
  return experiments.map(experimentToProjectCard);
}
