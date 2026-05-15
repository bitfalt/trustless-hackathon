import { z } from "zod";

import { createExperiment, getExperiments } from "@/lib/experiments";
import { errorResponse, ok, readJson } from "@/lib/api";
import { experimentsToProjectCards } from "@/lib/openlab-view-model";

const createExperimentSchema = z.object({
  title: z.string().min(3).max(120),
  location: z.string().min(2).max(120),
  category: z.enum(["Water", "Air", "Mobility", "Education", "Health"]),
  summary: z.string().min(20).max(500),
  problem: z.string().min(20).max(1000),
  methodology: z.string().min(20).max(1000),
  fundingGoal: z.number().positive(),
  creatorWallet: z.string().min(1),
  approverWallet: z.string().min(1),
  releaseSignerWallet: z.string().min(1),
  disputeResolverWallet: z.string().min(1),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        description: z.string().min(10).max(500),
        amount: z.number().positive(),
        deliverables: z.array(z.string().min(1).max(120)).min(1),
      }),
    )
    .min(1)
    .max(5),
});

export async function GET() {
  const experiments = getExperiments();
  return ok({ experiments, projects: experimentsToProjectCards(experiments) });
}

export async function POST(request: Request) {
  try {
    const input = await readJson(request, createExperimentSchema);
    const experiment = createExperiment(input);
    return ok({ experiment, project: experimentsToProjectCards([experiment])[0] }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
