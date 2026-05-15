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
  fundingGoal: number;
  fundedAmount: number;
  escrowContractId?: string;
  escrowViewerUrl?: string;
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
    image: imageByCategory[experiment.category] ?? "/images/project-biodiversity.jpg",
    artist: experiment.team.name,
    location: experiment.location,
    medium: experiment.methodology,
    article: `${experiment.summary}\n\n${experiment.problem}\n\n${experiment.methodology}\n\nMilestones:\n${milestoneSummary}`,
    fundingGoal: experiment.fundingGoal,
    fundedAmount: experiment.fundedAmount,
    escrowContractId: experiment.escrow.contractId ?? experiment.escrowContractId,
    escrowViewerUrl: experiment.escrow.viewerUrl ?? experiment.escrowViewerUrl,
  };
}

export function experimentsToProjectCards(experiments: Experiment[]): ProjectCardView[] {
  return experiments.map(experimentToProjectCard);
}
