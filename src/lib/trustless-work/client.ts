import type {
  ApproveMilestonePayload,
  ChangeMilestoneStatusPayload,
  CompleteMilestonePayload,
  FundEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  ReleaseMilestonePayload,
  SendTransactionPayload,
  SendTransactionResponse,
  TrustlessWorkClientOptions,
  UnsignedTransactionResponse,
} from "@/lib/trustless-work/types";

type JsonObject = Record<string, unknown>;

export class TrustlessWorkApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly providerError?: unknown,
  ) {
    super(message);
    this.name = "TrustlessWorkApiError";
  }
}

export class TrustlessWorkClient {
  private readonly apiBaseUrl: string;
  private readonly apiKey?: string;
  private readonly fetcher: typeof fetch;
  private readonly demoMode: boolean;

  constructor(options: TrustlessWorkClientOptions) {
    this.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetcher = options.fetcher ?? fetch;
    this.demoMode = options.demoMode ?? false;
  }

  initializeMultiReleaseEscrow(
    payload: InitializeMultiReleaseEscrowPayload,
  ): Promise<UnsignedTransactionResponse> {
    return this.postUnsigned("/deployer/multi-release", payload);
  }

  fundEscrow(payload: FundEscrowPayload): Promise<UnsignedTransactionResponse> {
    return this.postUnsigned("/escrow/multi-release/fund-escrow", payload);
  }

  completeMilestone(payload: CompleteMilestonePayload): Promise<UnsignedTransactionResponse> {
    return this.postUnsigned("/escrow/multi-release/complete-milestone", payload);
  }

  changeMilestoneStatus(payload: ChangeMilestoneStatusPayload): Promise<UnsignedTransactionResponse> {
    return this.postUnsigned("/escrow/multi-release/change-milestone-status", payload);
  }

  approveMilestone(payload: ApproveMilestonePayload): Promise<UnsignedTransactionResponse> {
    return this.postUnsigned("/escrow/multi-release/approve-milestone", payload);
  }

  releaseMilestone(payload: ReleaseMilestonePayload): Promise<UnsignedTransactionResponse> {
    return this.postUnsigned("/escrow/multi-release/release-milestone", payload);
  }

  getEscrowsByContractIds(contractIds: string[], validateOnChain = true): Promise<unknown> {
    const params = new URLSearchParams({
      contractIds: contractIds.join(","),
      validateOnChain: String(validateOnChain),
    });
    return this.get(`/helper/get-escrow-by-contract-ids?${params.toString()}`);
  }

  async sendTransaction(payload: SendTransactionPayload): Promise<SendTransactionResponse> {
    if (this.demoMode) {
      return {
        transactionHash: `demo_tx_${Date.now()}`,
        contractId: payload.signedXdr.includes("create") ? `demo_contract_${Date.now()}` : undefined,
        status: "demo_submitted",
        raw: { mode: "demo", payload },
      };
    }

    const raw = await this.post<JsonObject>("/helper/send-transaction", payload);
    return {
      transactionHash: extractFirstString(raw, ["transactionHash", "hash", "txHash", "tx_hash"]),
      contractId: extractFirstString(raw, ["contractId", "contract_id", "escrowContractId", "escrow"]),
      status: extractFirstString(raw, ["status", "result", "message"]),
      raw,
    };
  }

  private async postUnsigned(endpoint: string, payload: unknown): Promise<UnsignedTransactionResponse> {
    if (this.demoMode) {
      const encodedPayload = Buffer.from(JSON.stringify({ endpoint, payload })).toString("base64url");
      return {
        unsignedTransaction: `OPENLAB_DEMO_UNSIGNED_XDR.${encodedPayload}`,
        raw: {
          mode: "demo",
          endpoint,
          payload,
          message: "Demo unsigned XDR. Configure TRUSTLESS_WORK_API_KEY and unset OPENLAB_ESCROW_MODE=demo for real Trustless Work calls.",
        },
      };
    }

    const raw = await this.post<JsonObject>(endpoint, payload);
    const unsignedTransaction = extractFirstString(raw, ["unsignedTransaction", "xdr", "unsignedXdr"]);

    if (!unsignedTransaction) {
      throw new TrustlessWorkApiError("Trustless Work response did not include an unsigned transaction", 502, raw);
    }

    return { unsignedTransaction, raw };
  }

  private async post<T>(endpoint: string, payload: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  private async get<T>(endpoint: string): Promise<T> {
    if (this.demoMode) {
      return { mode: "demo", endpoint, escrows: [] } as T;
    }
    return this.request<T>(endpoint, { method: "GET" });
  }

  private async request<T>(endpoint: string, init: RequestInit): Promise<T> {
    if (!this.apiKey) {
      throw new TrustlessWorkApiError(
        "TRUSTLESS_WORK_API_KEY is required for real Trustless Work calls. Use OPENLAB_ESCROW_MODE=demo for local UI testing.",
        500,
      );
    }

    const response = await this.fetcher(`${this.apiBaseUrl}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        ...init.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new TrustlessWorkApiError(toUserMessage(response.status, data), response.status, data);
    }

    return data as T;
  }
}

export function createTrustlessWorkClientFromEnv(): TrustlessWorkClient {
  return new TrustlessWorkClient({
    apiBaseUrl: process.env.TRUSTLESS_WORK_API_BASE_URL ?? "https://api.trustlesswork.com",
    apiKey: process.env.TRUSTLESS_WORK_API_KEY,
    demoMode: process.env.OPENLAB_ESCROW_MODE === "demo",
  });
}

function extractFirstString(data: JsonObject, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  for (const value of Object.values(data)) {
    if (isRecord(value)) {
      const nested = extractFirstString(value, keys);
      if (nested) return nested;
    }
  }

  return undefined;
}

function toUserMessage(status: number, data: unknown): string {
  const providerMessage = isRecord(data) && typeof data.message === "string" ? data.message : undefined;

  switch (status) {
    case 400:
      return providerMessage ?? "Trustless Work rejected the request payload.";
    case 401:
      return "Trustless Work API key is missing or invalid.";
    case 404:
      return "Trustless Work escrow or endpoint was not found.";
    case 429:
      return "Trustless Work rate limit exceeded. Try again later.";
    default:
      return providerMessage ?? `Trustless Work API error (${status}).`;
  }
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
