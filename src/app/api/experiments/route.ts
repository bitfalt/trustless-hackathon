import { getExperiments } from "@/lib/experiments";
import { ok } from "@/lib/api";

export async function GET() {
  return ok({ experiments: getExperiments() });
}
