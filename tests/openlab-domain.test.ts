import { describe, expect, it } from "vitest";

import {
  addEvidenceToMilestone,
  approveMilestoneLocally,
  findExperimentBySlug,
  getExperiments,
  releaseMilestoneLocally,
} from "@/lib/experiments";

const waterWatchSlug = "waterwatch-costa-rica";

describe("OpenLab experiment domain", () => {
  it("seeds WaterWatch Costa Rica with three escrow milestones totaling 1,000 USDC", () => {
    const experiment = findExperimentBySlug(waterWatchSlug);

    expect(experiment?.title).toBe("WaterWatch Costa Rica");
    expect(experiment?.escrowType).toBe("multi-release");
    expect(experiment?.fundingGoal).toBe(1000);
    expect(experiment?.milestones).toHaveLength(3);
    expect(experiment?.milestones.map((milestone) => milestone.releasePercent)).toEqual([20, 40, 40]);
    expect(experiment?.milestones.reduce((sum, milestone) => sum + milestone.amount, 0)).toBe(1000);
  });

  it("returns experiment list copies so API callers cannot mutate seeded state", () => {
    const [firstExperiment] = getExperiments();
    firstExperiment.title = "mutated";

    expect(findExperimentBySlug(waterWatchSlug)?.title).toBe("WaterWatch Costa Rica");
  });

  it("adds milestone evidence and moves the milestone to ready_for_review", () => {
    const updated = addEvidenceToMilestone(waterWatchSlug, "waterwatch-methodology", [
      {
        id: "evidence-test-methodology",
        type: "methodology",
        title: "Sampling plan",
        url: "https://example.com/sampling-plan.pdf",
        submittedAt: "2026-05-14T00:00:00.000Z",
      },
    ]);

    const milestone = updated.milestones.find((item) => item.id === "waterwatch-methodology");
    expect(milestone?.status).toBe("ready_for_review");
    expect(milestone?.evidence.map((item) => item.title)).toContain("Sampling plan");
  });

  it("approves and releases milestones locally after Trustless Work transaction submission", () => {
    approveMilestoneLocally(waterWatchSlug, "waterwatch-methodology", "tx-approve-1");
    const released = releaseMilestoneLocally(waterWatchSlug, "waterwatch-methodology", "tx-release-1");

    const milestone = released.milestones.find((item) => item.id === "waterwatch-methodology");
    expect(milestone?.status).toBe("released");
    expect(milestone?.lastTransactionHash).toBe("tx-release-1");
  });
});
