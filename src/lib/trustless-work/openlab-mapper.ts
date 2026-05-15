import type { Experiment } from "@/lib/types";
import type {
  InitializeMultiReleaseEscrowInput,
  InitializeMultiReleaseEscrowPayload,
} from "@/lib/trustless-work/types";

export function buildEngagementId(experiment: Pick<Experiment, "slug">): string {
  return `openlab-${experiment.slug}`;
}

export function buildInitializeMultiReleaseEscrowPayload(
  experiment: Experiment,
  input: InitializeMultiReleaseEscrowInput,
): InitializeMultiReleaseEscrowPayload {
  const receiver = input.serviceProvider;

  return {
    signer: input.signer,
    engagementId: buildEngagementId(experiment),
    title: experiment.title,
    description: `${experiment.summary}\n\nProblem: ${experiment.problem}\n\nMethodology: ${experiment.methodology}`,
    roles: {
      approver: input.approver,
      serviceProvider: input.serviceProvider,
      platformAddress: input.platformAddress,
      releaseSigner: input.releaseSigner,
      disputeResolver: input.disputeResolver,
    },
    platformFee: input.platformFee ?? 0,
    milestones: experiment.milestones.map((milestone) => ({
      description: `${milestone.index + 1}. ${milestone.title}: ${milestone.deliverables.join(", ")}`,
      amount: milestone.amount,
      receiver: milestone.receiver ?? receiver,
    })),
    trustline: input.trustline,
  };
}

export function buildViewerUrl(contractId: string, baseUrl?: string): string {
  const normalizedBase = (baseUrl ?? process.env.NEXT_PUBLIC_ESCROW_VIEWER_BASE_URL ?? "https://viewer.trustlesswork.com")
    .replace(/\/$/, "");
  return `${normalizedBase}/${contractId}`;
}

export function getMilestoneByIndex(experiment: Experiment, milestoneIndex: number) {
  return experiment.milestones.find((milestone) => milestone.index === milestoneIndex);
}
