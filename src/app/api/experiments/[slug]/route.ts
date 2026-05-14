import { findExperimentBySlug } from "@/lib/experiments";
import { ok } from "@/lib/api";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const experiment = findExperimentBySlug(params.slug);

  if (!experiment) {
    return ok({ error: "Experiment not found" }, { status: 404 });
  }

  return ok({ experiment });
}
