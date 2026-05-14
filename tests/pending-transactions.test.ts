import { beforeEach, describe, expect, it } from "vitest";

import {
  consumePendingTransaction,
  createPendingTransaction,
  resetPendingTransactionsForTests,
} from "@/lib/pending-transactions";

describe("pending transaction correlation", () => {
  beforeEach(() => {
    resetPendingTransactionsForTests();
  });

  it("stores server-side operation metadata and consumes it exactly once", () => {
    const pending = createPendingTransaction({
      operation: "fund_escrow",
      experimentSlug: "waterwatch-costa-rica",
      contractId: "CONTRACT123",
      amount: 1000,
    });

    expect(pending.id).toMatch(/^ptx_/);
    expect(pending.operation).toBe("fund_escrow");

    const consumed = consumePendingTransaction(pending.id);
    expect(consumed?.contractId).toBe("CONTRACT123");
    expect(consumePendingTransaction(pending.id)).toBeUndefined();
  });

  it("expires stale pending transactions instead of mutating local state forever", () => {
    const pending = createPendingTransaction({
      operation: "approve_milestone",
      experimentSlug: "waterwatch-costa-rica",
      contractId: "CONTRACT123",
      milestoneId: "waterwatch-methodology",
      milestoneIndex: 0,
      expiresAt: "2020-01-01T00:00:00.000Z",
    });

    expect(consumePendingTransaction(pending.id)).toBeUndefined();
  });
});
