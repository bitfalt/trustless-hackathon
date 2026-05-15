import { beforeEach, describe, expect, it } from "vitest";

import {
  addEvidenceToMilestone,
  assertExperimentRole,
  approveMilestoneLocally,
  attachEscrowCreation,
  attachEscrowFunding,
  createExperiment,
  findExperimentBySlug,
  getExperiments,
  releaseMilestoneLocally,
  resetExperimentsForTests,
  validateMilestoneOperation,
} from "@/lib/experiments";

const waterWatchSlug = "community-water-quality-study";

describe("OpenLab experiment domain", () => {
  beforeEach(() => {
    resetExperimentsForTests();
  });

  it("seeds Community Water Quality Study with two escrow milestones totaling 300 USDC", () => {
    const experiment = findExperimentBySlug(waterWatchSlug);

    expect(experiment?.title).toBe("Community Water Quality Study");
    expect(experiment?.escrowType).toBe("multi-release");
    expect(experiment?.fundingGoal).toBe(300);
    expect(experiment?.milestones).toHaveLength(2);
    expect(experiment?.milestones.map((milestone) => milestone.releasePercent)).toEqual([50, 50]);
    expect(experiment?.milestones.reduce((sum, milestone) => sum + milestone.amount, 0)).toBe(300);
  });

  it("returns experiment list copies so API callers cannot mutate seeded state", () => {
    const [firstExperiment] = getExperiments();
    firstExperiment.title = "mutated";

    expect(findExperimentBySlug(waterWatchSlug)?.title).toBe("Community Water Quality Study");
  });

  it("adds milestone evidence and moves the milestone to ready_for_review", () => {
    const updated = addEvidenceToMilestone(waterWatchSlug, "community-water-quality-study-milestone-1", [
      {
        id: "evidence-test-methodology",
        type: "methodology",
        title: "Sampling plan",
        url: "https://example.com/sampling-plan.pdf",
        submittedAt: "2026-05-14T00:00:00.000Z",
      },
    ]);

    const milestone = updated.milestones.find((item) => item.id === "community-water-quality-study-milestone-1");
    expect(milestone?.status).toBe("ready_for_review");
    expect(milestone?.evidence.map((item) => item.title)).toContain("Sampling plan");
  });

  it("rejects duplicate evidence IDs on the same milestone", () => {
    const evidence = {
      id: "evidence-test-methodology",
      type: "methodology" as const,
      title: "Sampling plan",
      url: "https://example.com/sampling-plan.pdf",
      submittedAt: "2026-05-14T00:00:00.000Z",
    };

    addEvidenceToMilestone(waterWatchSlug, "community-water-quality-study-milestone-1", [evidence]);

    expect(() => addEvidenceToMilestone(waterWatchSlug, "community-water-quality-study-milestone-1", [evidence])).toThrow(
      /already exists/,
    );
  });

  it("marks Trustless Work approval separately from milestone fund release", () => {
    const approved = approveMilestoneLocally(waterWatchSlug, "community-water-quality-study-milestone-1", "tx-approve-1");

    const milestone = approved.milestones.find((item) => item.id === "community-water-quality-study-milestone-1");
    expect(milestone?.status).toBe("approved");
    expect(milestone?.trustlessWorkStatus).toContain("Approved");
    expect(milestone?.lastTransactionHash).toBe("tx-approve-1");
  });

  it("marks the experiment completed when all milestones have been released", () => {
    releaseMilestoneLocally(waterWatchSlug, "community-water-quality-study-milestone-1", "tx-release-1");
    const completed = releaseMilestoneLocally(waterWatchSlug, "community-water-quality-study-milestone-2", "tx-release-2");

    expect(completed.status).toBe("completed");
  });

  it("rejects mismatched milestone IDs and indices before creating Trustless Work transactions", () => {
    expect(() =>
      validateMilestoneOperation({
        experimentSlug: waterWatchSlug,
        milestoneId: "community-water-quality-study-milestone-1",
        milestoneIndex: 2,
      }),
    ).toThrow(/does not match milestone index/);
  });

  it("rejects contract IDs that do not match the experiment escrow", () => {
    attachEscrowCreation(waterWatchSlug, "CONTRACT_REAL", "tx-create");

    expect(() =>
      validateMilestoneOperation({
        experimentSlug: waterWatchSlug,
        milestoneId: "community-water-quality-study-milestone-1",
        milestoneIndex: 0,
        contractId: "CONTRACT_FAKE",
      }),
    ).toThrow(/does not match experiment escrow contract/);
  });

  it("rejects overfunding locally so the UI cannot display false escrow balances", () => {
    attachEscrowFunding(waterWatchSlug, 300, "tx-fund-1");

    expect(() => attachEscrowFunding(waterWatchSlug, 1, "tx-fund-2")).toThrow(/exceeds remaining funding/);
  });

  it("creates wallet-owned experiments with role metadata", () => {
    const experiment = createExperiment({
      title: "Neighborhood Soil Study",
      location: "Cartago, Costa Rica",
      category: "Health",
      summary: "A community study measures soil health indicators with public evidence.",
      problem: "Families need transparent soil quality information before planting community gardens.",
      methodology: "The team collects samples, uploads lab evidence, and publishes an open report.",
      fundingGoal: 300,
      creatorWallet: "G_CREATOR",
      approverWallet: "G_APPROVER",
      releaseSignerWallet: "G_RELEASE",
      disputeResolverWallet: "G_DISPUTE",
      milestones: [
        {
          title: "Sampling",
          description: "Collect samples from approved sites.",
          amount: 300,
          deliverables: ["site list", "samples"],
        },
      ],
    });

    expect(experiment.slug).toBe("neighborhood-soil-study");
    expect(experiment.creatorWallet).toBe("G_CREATOR");
    expect(experiment.escrow.approverWallet).toBe("G_APPROVER");
    expect(() => assertExperimentRole(experiment, "G_APPROVER", "approver")).not.toThrow();
    expect(() => assertExperimentRole(experiment, "G_OTHER", "approver")).toThrow(/not the approver/);
  });

  it("rejects submitted experiments whose milestones do not match the funding goal", () => {
    expect(() =>
      createExperiment({
        title: "Bad Budget Study",
        location: "Cartago",
        category: "Water",
        summary: "A project with a bad milestone total should fail validation.",
        problem: "The project should not be accepted with inconsistent escrow math.",
        methodology: "The team would collect data and publish results.",
        fundingGoal: 300,
        creatorWallet: "G_CREATOR",
        approverWallet: "G_APPROVER",
        releaseSignerWallet: "G_RELEASE",
        disputeResolverWallet: "G_DISPUTE",
        milestones: [{ title: "Only milestone", description: "Does not add up.", amount: 150, deliverables: ["x"] }],
      }),
    ).toThrow(/funding goal/);
  });
});
