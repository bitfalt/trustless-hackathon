import { ok } from "@/lib/api";
import { getExperiments } from "@/lib/experiments";

export async function GET() {
  const reviews = getExperiments().flatMap((experiment) =>
    experiment.milestones
      .filter((milestone) => milestone.status === "ready_for_review")
      .map((milestone) => ({
        experiment: {
          id: experiment.id,
          slug: experiment.slug,
          title: experiment.title,
          location: experiment.location,
        },
        milestone: {
          id: milestone.id,
          index: milestone.index,
          title: milestone.title,
          amount: milestone.amount,
          releasePercent: milestone.releasePercent,
          deliverables: milestone.deliverables,
          evidenceCount: milestone.evidence.length,
          evidence: milestone.evidence,
          status: milestone.status,
        },
        verifier: experiment.verifier,
        escrow: experiment.escrow,
      })),
  );

  return ok({ reviews });
}
