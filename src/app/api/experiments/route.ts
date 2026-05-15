import { getExperiments } from "@/lib/experiments";
import { ok } from "@/lib/api";
import { experimentsToProjectCards } from "@/lib/openlab-view-model";

export async function GET() {
  const experiments = getExperiments();
  return ok({ experiments, projects: experimentsToProjectCards(experiments) });
}
