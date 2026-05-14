import { z } from "zod";

import { errorResponse, evidenceSchema, ok, readJson } from "@/lib/api";
import { addEvidenceToMilestone } from "@/lib/experiments";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  experimentSlug: z.string().min(1),
  evidence: z.array(evidenceSchema).min(1),
  notes: z.string().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const input = await readJson(request, schema);
    const submittedAt = new Date().toISOString();
    const experiment = addEvidenceToMilestone(
      input.experimentSlug,
      params.id,
      input.evidence.map((evidence) => ({
        ...evidence,
        submittedAt: evidence.submittedAt ?? submittedAt,
        notes: evidence.notes ?? input.notes,
      })),
    );

    return ok({ milestoneId: params.id, experiment });
  } catch (error) {
    return errorResponse(error);
  }
}
