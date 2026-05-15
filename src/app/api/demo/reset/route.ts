import { ok } from "@/lib/api";
import { resetExperimentsForTests } from "@/lib/experiments";
import { resetPendingTransactionsForTests } from "@/lib/pending-transactions";

export async function POST() {
  resetExperimentsForTests();
  resetPendingTransactionsForTests();

  return ok({
    status: "reset",
    message: "Demo experiment and pending transaction state reset to the seeded Trustless Work scenario.",
  });
}
