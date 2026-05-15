import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

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
let pendingTransactions = loadPendingTransactions();

export function createPendingTransaction(input: CreatePendingTransactionInput): PendingTransaction {
  const now = new Date();
  const pending: PendingTransaction = {
    ...input,
    id: `ptx_${randomUUID()}`,
    createdAt: now.toISOString(),
    expiresAt: input.expiresAt ?? new Date(now.getTime() + DEFAULT_TTL_MS).toISOString(),
  };

  pendingTransactions.set(pending.id, clone(pending));
  persistPendingTransactions();
  return clone(pending);
}

export function getPendingTransaction(id: string): PendingTransaction | undefined {
  const pending = pendingTransactions.get(id);
  if (!pending || isExpired(pending)) {
    if (pending) {
      pendingTransactions.delete(id);
      persistPendingTransactions();
    }
    return undefined;
  }
  return clone(pending);
}

export function consumePendingTransaction(id: string): PendingTransaction | undefined {
  const pending = getPendingTransaction(id);
  if (!pending) return undefined;
  pendingTransactions.delete(id);
  persistPendingTransactions();
  return { ...pending, consumedAt: new Date().toISOString() };
}

export function resetPendingTransactionsForTests(): void {
  pendingTransactions = new Map<string, PendingTransaction>();
  persistPendingTransactions();
}

function isExpired(pending: PendingTransaction): boolean {
  return Date.parse(pending.expiresAt) <= Date.now();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function dataFilePath(): string {
  return resolve(process.env.OPENLAB_PENDING_TRANSACTIONS_FILE ?? ".openlab-pending-transactions.json");
}

function loadPendingTransactions(): Map<string, PendingTransaction> {
  const filePath = dataFilePath();
  if (!existsSync(filePath)) return new Map();

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { pendingTransactions?: PendingTransaction[] };
    const active = (parsed.pendingTransactions ?? []).filter((pending) => !isExpired(pending));
    return new Map(active.map((pending) => [pending.id, pending]));
  } catch (error) {
    console.warn("Failed to load persisted pending transactions", error);
    return new Map();
  }
}

function persistPendingTransactions(): void {
  try {
    const filePath = dataFilePath();
    mkdirSync(dirname(filePath), { recursive: true });
    const active = [...pendingTransactions.values()].filter((pending) => !isExpired(pending));
    writeFileSync(filePath, `${JSON.stringify({ pendingTransactions: active }, null, 2)}\n`);
  } catch (error) {
    console.warn("Failed to persist pending transactions", error);
  }
}
