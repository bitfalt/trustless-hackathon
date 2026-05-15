import { describe, expect, it } from "vitest";

import { findExperimentBySlug } from "@/lib/experiments";
import { experimentToProjectCard } from "@/lib/openlab-view-model";

describe("OpenLab project view model", () => {
  it("maps backend experiment state into the frontend project card contract", () => {
    const experiment = findExperimentBySlug("waterwatch-costa-rica");
    expect(experiment).toBeDefined();

    const project = experimentToProjectCard(experiment!);

    expect(project.slug).toBe("waterwatch-costa-rica");
    expect(project.title).toBe("WaterWatch Costa Rica");
    expect(project.metrics).toBe(`${experiment!.fundedAmount}/${experiment!.fundingGoal} USDC`);
    expect(project.artist).toBe("WaterWatch Student Lab");
    expect(project.article).toContain("Milestones:");
    expect(project.article).toContain("Methodology approved");
  });
});
