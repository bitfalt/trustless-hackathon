import { randomUUID } from "node:crypto";

export type PendingOperation =
  | "create_escrow"
  | "fund_escrow"
  | "complete_milestone"
  | "approve_milestone"
  | "release_milestone";

export type PendingTransaction = {
  id: string;
  operation: PendingOperation;
  experimentSlug: string;
  contractId?: string;
  expectedContractId?: string;
  milestoneId?: string;
  milestoneIndex?: number;
  amount?: number;
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
};

type CreatePendingTransactionInput = Omit<PendingTransaction, "id" | "createdAt" | "expiresAt" | "consumedAt"> & {
  expiresAt?: string;
};

const DEFAULT_TTL_MS = 15 * 60 * 1000;
let pendingTransactions = new Map<string, PendingTransaction>();

export function createPendingTransaction(input: CreatePendingTransactionInput): PendingTransaction {
  const now = new Date();
  const pending: PendingTransaction = {
    ...input,
    id: `ptx_${randomUUID()}`,
    createdAt: now.toISOString(),
    expiresAt: input.expiresAt ?? new Date(now.getTime() + DEFAULT_TTL_MS).toISOString(),
  };

  pendingTransactions.set(pending.id, clone(pending));
  return clone(pending);
}

export function getPendingTransaction(id: string): PendingTransaction | undefined {
  const pending = pendingTransactions.get(id);
  if (!pending || isExpired(pending)) {
    if (pending) pendingTransactions.delete(id);
    return undefined;
  }
  return clone(pending);
}

export function consumePendingTransaction(id: string): PendingTransaction | undefined {
  const pending = getPendingTransaction(id);
  if (!pending) return undefined;
  pendingTransactions.delete(id);
  return { ...pending, consumedAt: new Date().toISOString() };
}

export function resetPendingTransactionsForTests(): void {
  pendingTransactions = new Map<string, PendingTransaction>();
}

function isExpired(pending: PendingTransaction): boolean {
  return Date.parse(pending.expiresAt) <= Date.now();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
