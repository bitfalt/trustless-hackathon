import { beforeEach, describe, expect, it } from "vitest";

import { findExperimentBySlug, resetExperimentsForTests } from "@/lib/experiments";
import { experimentToProjectCard } from "@/lib/openlab-view-model";

describe("OpenLab project view model", () => {
  beforeEach(() => {
    resetExperimentsForTests();
  });

  it("maps backend experiment state into the frontend project card contract", () => {
    const experiment = findExperimentBySlug("community-water-quality-study");
    expect(experiment).toBeDefined();

    const project = experimentToProjectCard(experiment!);

    expect(project.slug).toBe("community-water-quality-study");
    expect(project.title).toBe("Community Water Quality Study");
    expect(project.metrics).toBe(`${experiment!.fundedAmount}/${experiment!.fundingGoal} USDC`);
    expect(project.artist).toBe("Community Water Lab");
    expect(project.article).toContain("Milestones:");
    expect(project.article).toContain("Sampling plan verified");
  });
});
