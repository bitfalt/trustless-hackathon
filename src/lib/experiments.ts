import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { EscrowMetadata, Evidence, Experiment, MilestoneStatus } from "@/lib/types";
import { buildViewerUrl } from "@/lib/trustless-work/openlab-mapper";

const testnet = "testnet" as const;

const seededExperiments: Experiment[] = [
  {
    id: "exp-waterwatch-cr",
    title: "WaterWatch Costa Rica",
    slug: "waterwatch-costa-rica",
    location: "Cartago, Costa Rica",
    category: "Water",
    summary: "A school/community measures local water contamination and publishes open data for residents.",
    problem:
      "Small communities often suspect water contamination but lack transparent funding and verification to collect credible public data.",
    methodology:
      "Students and community members collect samples from predefined locations, record pH/turbidity/contamination indicators, publish raw measurements, and summarize findings in a public report.",
    fundingGoal: 1000,
    fundedAmount: 0,
    currency: "USDC",
    status: "funding",
    escrowType: "multi-release",
    escrow: {
      type: "multi-release",
      engagementId: "openlab-waterwatch-costa-rica",
      network: testnet,
      mode: "real",
      balance: 0,
    },
    team: {
      name: "WaterWatch Student Lab",
      type: "school",
    },
    verifier: {
      name: "University Science Mentor",
      role: "Water quality reviewer",
    },
    disputeResolver: {
      name: "OpenLab Review Council",
    },
    milestones: [
      {
        id: "waterwatch-methodology",
        index: 0,
        title: "Methodology approved",
        description: "Sampling design and safety plan are reviewed before field work starts.",
        releasePercent: 20,
        amount: 200,
        status: "locked",
        deliverables: ["sampling plan", "locations", "variables to measure", "schedule", "safety checklist"],
        evidence: [],
      },
      {
        id: "waterwatch-field-data",
        index: 1,
        title: "Field data collected",
        description: "The team collects and uploads geotagged sample evidence and raw measurements.",
        releasePercent: 40,
        amount: 400,
        status: "locked",
        deliverables: ["geotagged photos", "raw measurements", "completed forms", "timestamps"],
        evidence: [],
      },
      {
        id: "waterwatch-open-report",
        index: 2,
        title: "Open report published",
        description: "Cleaned data, charts, recommendations, and the public report are published.",
        releasePercent: 40,
        amount: 400,
        status: "locked",
        deliverables: ["cleaned dataset", "charts", "public report", "recommendations"],
        evidence: [],
      },
    ],
    results: {
      datasetUrl: "https://example.com/openlab/waterwatch/raw-measurements.csv",
      reportUrl: "https://example.com/openlab/waterwatch/report.pdf",
      chartData: [
        { label: "Site A", value: 7.1 },
        { label: "Site B", value: 6.8 },
        { label: "Site C", value: 7.4 },
      ],
      summary: "Demo result set showing sample pH measurements across collection sites.",
    },
  },
  {
    id: "exp-air-quality-schools",
    title: "Air Quality Around Schools",
    slug: "air-quality-around-schools",
    location: "San José, Costa Rica",
    category: "Air",
    summary: "Students place low-cost sensors near schools and publish a pollution snapshot.",
    problem: "Families lack local measurements around school commute corridors.",
    methodology: "Deploy sensors, collect readings at fixed intervals, and publish a comparison chart.",
    fundingGoal: 750,
    fundedAmount: 0,
    currency: "USDC",
    status: "draft",
    escrowType: "multi-release",
    escrow: {
      type: "multi-release",
      engagementId: "openlab-air-quality-around-schools",
      network: testnet,
      mode: "demo",
      balance: 0,
    },
    team: { name: "School Air Lab", type: "student" },
    verifier: { name: "Environmental Science Mentor", role: "Air quality reviewer" },
    milestones: [],
  },
  {
    id: "exp-open-gps-bus-study",
    title: "Open GPS Bus Study",
    slug: "open-gps-bus-study",
    location: "Cartago, Costa Rica",
    category: "Mobility",
    summary: "A civic team logs bus arrival times and publishes open mobility reliability data.",
    problem: "Bus riders lack transparent reliability metrics for common routes.",
    methodology: "Collect timestamped arrivals, compare against schedules, and publish delay distributions.",
    fundingGoal: 600,
    fundedAmount: 0,
    currency: "USDC",
    status: "draft",
    escrowType: "multi-release",
    escrow: {
      type: "multi-release",
      engagementId: "openlab-open-gps-bus-study",
      network: testnet,
      mode: "demo",
      balance: 0,
    },
    team: { name: "Open Mobility CR", type: "civic-team" },
    verifier: { name: "Municipal Mobility Reviewer", role: "Transport data reviewer" },
    milestones: [],
  },
];

let experiments = loadExperiments();

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
  return releaseMilestoneLocally(experimentSlug, milestoneId, transactionHash, "Approved and Released through Trustless Work");
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
): Experiment {
  const experiment = requireExperimentBySlug(experimentSlug);
  const viewerUrl = buildViewerUrl(contractId);
  experiment.escrowContractId = contractId;
  experiment.escrowViewerUrl = viewerUrl;
  experiment.escrow = {
    ...experiment.escrow,
    contractId,
    viewerUrl,
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
  if (!existsSync(filePath)) return clone(seededExperiments);

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { experiments?: Experiment[] };
    if (Array.isArray(parsed.experiments) && parsed.experiments.length > 0) {
      return parsed.experiments;
    }
  } catch (error) {
    console.warn("Failed to load persisted OpenLab experiment state; using seeds", error);
  }

  return clone(seededExperiments);
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
