import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { EscrowMetadata, Evidence, Experiment, MilestoneStatus } from "@/lib/types";
import { buildViewerUrl } from "@/lib/trustless-work/openlab-mapper";

const testnet = "testnet" as const;

const seededExperiments: Experiment[] = [
  {
    id: "exp-community-water-quality-study",
    title: "Community Water Quality Study",
    slug: "community-water-quality-study",
    location: "Cartago, Costa Rica",
    category: "Water",
    summary: "A community team measures water quality and publishes evidence for local residents.",
    problem: "Residents need transparent local water quality data before they can advocate for remediation.",
    methodology: "The team collects scheduled samples, records field measurements, uploads raw evidence, and publishes an open report.",
    fundingGoal: 300,
    fundedAmount: 0,
    currency: "USDC",
    status: "funding",
    escrowType: "multi-release",
    escrow: {
      type: "multi-release",
      engagementId: "openlab-community-water-quality-study",
      network: testnet,
      mode: "real",
      balance: 0,
    },
    team: {
      name: "Community Water Lab",
      type: "community",
    },
    verifier: {
      name: "Community Science Verifier",
      role: "Water quality reviewer",
    },
    disputeResolver: {
      name: "EcoProof Review Council",
    },
    milestones: [
      {
        id: "community-water-quality-study-milestone-1",
        index: 0,
        title: "Sampling plan verified",
        description: "Verifier reviews the water sampling map, safety checklist, and collection protocol.",
        releasePercent: 50,
        amount: 150,
        status: "locked",
        deliverables: ["sampling map", "safety checklist", "collection protocol"],
        evidence: [],
      },
      {
        id: "community-water-quality-study-milestone-2",
        index: 1,
        title: "Open water report published",
        description: "Project team publishes the field dataset, photos, and final community water report.",
        releasePercent: 50,
        amount: 150,
        status: "locked",
        deliverables: ["field dataset", "sample photos", "public report"],
        evidence: [],
      },
    ],
  },
];

let experiments = loadExperiments();

export type CreateExperimentInput = {
  title: string;
  location: string;
  category: Experiment["category"];
  summary: string;
  problem: string;
  methodology: string;
  fundingGoal: number;
  creatorWallet: string;
  approverWallet: string;
  releaseSignerWallet: string;
  disputeResolverWallet: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deliverables: string[];
  }>;
};

export function getExperiments(): Experiment[] {
  return clone(experiments);
}

export function findExperimentBySlug(slug: string): Experiment | undefined {
  const experiment = experiments.find((item) => item.slug === slug);
  return experiment ? clone(experiment) : undefined;
}

export function requireExperimentBySlug(slug: string): Experiment {
  const experiment = experiments.find((item) => item.slug === slug);
  if (!experiment) {
    throw new Error(`Experiment not found: ${slug}`);
  }
  return experiment;
}

export function createExperiment(input: CreateExperimentInput): Experiment {
  const totalMilestoneAmount = input.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  if (Math.abs(totalMilestoneAmount - input.fundingGoal) > 0.000001) {
    throw new Error("Milestone amounts must add up to the funding goal");
  }

  const baseSlug = slugify(input.title);
  const slug = experiments.some((experiment) => experiment.slug === baseSlug)
    ? `${baseSlug}-${Date.now()}`
    : baseSlug;
  const experiment: Experiment = {
    id: `exp-${slug}`,
    title: input.title,
    slug,
    location: input.location,
    category: input.category,
    summary: input.summary,
    problem: input.problem,
    methodology: input.methodology,
    fundingGoal: input.fundingGoal,
    fundedAmount: 0,
    currency: "USDC",
    status: "draft",
    escrowType: "multi-release",
    creatorWallet: input.creatorWallet,
    escrow: {
      type: "multi-release",
      engagementId: `openlab-${slug}`,
      network: testnet,
      mode: "real",
      balance: 0,
      serviceProviderWallet: input.creatorWallet,
      approverWallet: input.approverWallet,
      releaseSignerWallet: input.releaseSignerWallet,
      disputeResolverWallet: input.disputeResolverWallet,
    },
    team: {
      name: input.title,
      type: "community",
      walletAddress: input.creatorWallet,
    },
    verifier: {
      name: "Connected verifier",
      role: "Milestone approver",
      walletAddress: input.approverWallet,
    },
    disputeResolver: {
      name: "Connected dispute resolver",
      walletAddress: input.disputeResolverWallet,
    },
    milestones: input.milestones.map((milestone, index) => ({
      id: `${slug}-milestone-${index + 1}`,
      index,
      title: milestone.title,
      description: milestone.description,
      releasePercent: Math.round((milestone.amount / input.fundingGoal) * 100),
      amount: milestone.amount,
      receiver: input.creatorWallet,
      status: "locked",
      deliverables: milestone.deliverables,
      evidence: [],
    })),
  };

  experiments.unshift(experiment);
  persistExperiments();
  return clone(experiment);
}

export function addEvidenceToMilestone(experimentSlug: string, milestoneId: string, evidence: Evidence[]): Experiment {
  const experiment = requireExperimentBySlug(experimentSlug);
  const milestone = requireMilestone(experiment, milestoneId);

  const duplicate = evidence.find((newEvidence) => milestone.evidence.some((existing) => existing.id === newEvidence.id));
  if (duplicate) {
    throw new Error(`Evidence ID ${duplicate.id} already exists on milestone ${milestoneId}`);
  }

  milestone.evidence.push(...evidence);
  milestone.status = "ready_for_review";
  milestone.trustlessWorkStatus = "Ready for verifier review";

  if (experiment.status === "funded") {
    experiment.status = "in_progress";
  }

  persistExperiments();
  return clone(experiment);
}

export function assertExperimentRole(
  experiment: Experiment,
  walletAddress: string | undefined,
  role: "creator" | "serviceProvider" | "approver" | "releaseSigner",
): void {
  if (!walletAddress) throw new Error("Connected wallet is required for this action");
  const normalizedWallet = walletAddress.toUpperCase();
  const expected = roleAddress(experiment, role)?.toUpperCase();
  if (!expected || normalizedWallet !== expected) {
    throw new Error(`Connected wallet is not the ${role} for this escrow`);
  }
}

export function markMilestoneCompleteLocally(
  experimentSlug: string,
  milestoneId: string,
  transactionHash?: string,
): Experiment {
  return updateMilestoneStatus(experimentSlug, milestoneId, "ready_for_review", "Milestone marked complete", transactionHash);
}

export function approveMilestoneLocally(
  experimentSlug: string,
  milestoneId: string,
  transactionHash?: string,
): Experiment {
  return updateMilestoneStatus(experimentSlug, milestoneId, "approved", "Approved through Trustless Work", transactionHash);
}

export function releaseMilestoneLocally(
  experimentSlug: string,
  milestoneId: string,
  transactionHash?: string,
  trustlessWorkStatus = "Released through Trustless Work",
): Experiment {
  const experiment = updateMilestoneStatus(
    experimentSlug,
    milestoneId,
    "released",
    trustlessWorkStatus,
    transactionHash,
  );

  const allReleased = experiment.milestones.length > 0 && experiment.milestones.every((item) => item.status === "released");
  if (allReleased) {
    requireExperimentBySlug(experimentSlug).status = "completed";
    persistExperiments();
    return clone(requireExperimentBySlug(experimentSlug));
  }

  return experiment;
}

export function attachEscrowCreation(
  experimentSlug: string,
  contractId: string,
  transactionHash?: string,
  mode?: EscrowMetadata["mode"],
  roles?: Partial<Pick<EscrowMetadata, "serviceProviderWallet" | "approverWallet" | "releaseSignerWallet" | "platformWallet" | "disputeResolverWallet">>,
): Experiment {
  const experiment = requireExperimentBySlug(experimentSlug);
  const viewerUrl = buildViewerUrl(contractId);
  experiment.escrowContractId = contractId;
  experiment.escrowViewerUrl = viewerUrl;
  experiment.escrow = {
    ...experiment.escrow,
    contractId,
    viewerUrl,
    mode: mode ?? experiment.escrow.mode,
    ...roles,
    createdTransactionHash: transactionHash,
    lastOperation: "create_escrow",
    lastTransactionHash: transactionHash,
  } satisfies EscrowMetadata;
  persistExperiments();
  return clone(experiment);
}

export function attachEscrowFunding(
  experimentSlug: string,
  amount: number,
  transactionHash?: string,
): Experiment {
  const experiment = requireExperimentBySlug(experimentSlug);
  const remaining = experiment.fundingGoal - experiment.fundedAmount;

  if (amount <= 0) {
    throw new Error("Funding amount must be positive");
  }

  if (amount > remaining) {
    throw new Error(`Funding amount ${amount} exceeds remaining funding ${remaining}`);
  }

  experiment.fundedAmount = Math.min(experiment.fundingGoal, experiment.fundedAmount + amount);
  experiment.status = experiment.fundedAmount >= experiment.fundingGoal ? "funded" : "funding";
  experiment.escrow = {
    ...experiment.escrow,
    balance: (experiment.escrow.balance ?? 0) + amount,
    fundedTransactionHash: transactionHash,
    lastOperation: "fund_escrow",
    lastTransactionHash: transactionHash,
  } satisfies EscrowMetadata;
  persistExperiments();
  return clone(experiment);
}

export function resetExperimentsForTests(): void {
  experiments = clone(seededExperiments);
  persistExperiments();
}

export function validateMilestoneOperation(input: {
  experimentSlug: string;
  milestoneId: string;
  milestoneIndex?: number | string;
  contractId?: string;
}): { experiment: Experiment; milestoneId: string; milestoneIndex: number } {
  const experiment = requireExperimentBySlug(input.experimentSlug);
  const milestone = requireMilestone(experiment, input.milestoneId);

  if (input.milestoneIndex !== undefined && Number(input.milestoneIndex) !== milestone.index) {
    throw new Error(`Milestone ID ${input.milestoneId} does not match milestone index ${input.milestoneIndex}`);
  }

  const storedContractId = experiment.escrow.contractId ?? experiment.escrowContractId;
  if (input.contractId && !storedContractId) {
    throw new Error(`Experiment ${input.experimentSlug} does not have an escrow contract yet`);
  }
  if (input.contractId && storedContractId && input.contractId !== storedContractId) {
    throw new Error(`Contract ID ${input.contractId} does not match experiment escrow contract ${storedContractId}`);
  }

  return { experiment: clone(experiment), milestoneId: milestone.id, milestoneIndex: milestone.index };
}

function updateMilestoneStatus(
  experimentSlug: string,
  milestoneId: string,
  status: MilestoneStatus,
  trustlessWorkStatus: string,
  transactionHash?: string,
): Experiment {
  const experiment = requireExperimentBySlug(experimentSlug);
  const milestone = requireMilestone(experiment, milestoneId);
  milestone.status = status;
  milestone.trustlessWorkStatus = trustlessWorkStatus;
  milestone.lastTransactionHash = transactionHash;
  experiment.escrow.lastTransactionHash = transactionHash;
  experiment.escrow.lastOperation = status;
  if (status === "approved" || status === "released") {
    experiment.status = "in_progress";
  }
  persistExperiments();
  return clone(experiment);
}

function requireMilestone(experiment: Experiment, milestoneId: string) {
  const milestone = experiment.milestones.find((item) => item.id === milestoneId);
  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }
  return milestone;
}

function dataFilePath(): string {
  return resolve(process.env.OPENLAB_DATA_FILE ?? ".openlab-data.json");
}

function loadExperiments(): Experiment[] {
  const filePath = dataFilePath();
  if (!existsSync(filePath)) return shouldUseSeededExperiments() ? clone(seededExperiments) : [];

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { experiments?: Experiment[] };
    if (Array.isArray(parsed.experiments) && parsed.experiments.length > 0) {
      return parsed.experiments;
    }
  } catch (error) {
    console.warn("Failed to load persisted OpenLab experiment state; using seeds", error);
  }

  return shouldUseSeededExperiments() ? clone(seededExperiments) : [];
}

function persistExperiments(): void {
  try {
    const filePath = dataFilePath();
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify({ experiments }, null, 2)}\n`);
  } catch (error) {
    console.warn("Failed to persist OpenLab experiment state", error);
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function roleAddress(experiment: Experiment, role: "creator" | "serviceProvider" | "approver" | "releaseSigner") {
  switch (role) {
    case "creator":
    case "serviceProvider":
      return experiment.escrow.serviceProviderWallet ?? experiment.team.walletAddress ?? experiment.creatorWallet;
    case "approver":
      return experiment.escrow.approverWallet ?? experiment.verifier.walletAddress;
    case "releaseSigner":
      return experiment.escrow.releaseSignerWallet;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shouldUseSeededExperiments(): boolean {
  return process.env.OPENLAB_ENABLE_SEEDS === "true";
}
