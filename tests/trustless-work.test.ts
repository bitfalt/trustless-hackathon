import { beforeEach, describe, expect, it, vi } from "vitest";

import { findExperimentBySlug, resetExperimentsForTests } from "@/lib/experiments";
import { TrustlessWorkClient, createTrustlessWorkClientFromEnv } from "@/lib/trustless-work/client";
import { buildInitializeMultiReleaseEscrowPayload, buildViewerUrl } from "@/lib/trustless-work/openlab-mapper";

const addresses = {
  signer: "G_SIGNER_OPENLAB_TEST",
  serviceProvider: "G_SERVICE_PROVIDER_TEST",
  approver: "G_APPROVER_TEST",
  platformAddress: "G_PLATFORM_TEST",
  releaseSigner: "G_RELEASE_SIGNER_TEST",
  disputeResolver: "G_DISPUTE_RESOLVER_TEST",
  trustline: {
    address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    symbol: "USDC" as const,
  },
};

describe("Trustless Work mapping", () => {
  beforeEach(() => {
    resetExperimentsForTests();
  });

  it("maps WaterWatch into a valid multi-release escrow deploy payload", () => {
    const experiment = findExperimentBySlug("waterwatch-costa-rica");
    expect(experiment).toBeDefined();

    const payload = buildInitializeMultiReleaseEscrowPayload(experiment!, addresses);

    expect(payload.signer).toBe(addresses.signer);
    expect(payload.engagementId).toBe("openlab-waterwatch-costa-rica");
    expect(payload.title).toContain("WaterWatch Costa Rica");
    expect(payload.roles).toEqual({
      approver: addresses.approver,
      serviceProvider: addresses.serviceProvider,
      platformAddress: addresses.platformAddress,
      releaseSigner: addresses.releaseSigner,
      disputeResolver: addresses.disputeResolver,
    });
    expect(payload.platformFee).toBe(0);
    expect(payload.trustline).toEqual(addresses.trustline);
    expect(payload.milestones).toEqual([
      expect.objectContaining({ amount: 200, receiver: addresses.serviceProvider }),
      expect.objectContaining({ amount: 400, receiver: addresses.serviceProvider }),
      expect.objectContaining({ amount: 400, receiver: addresses.serviceProvider }),
    ]);
  });

  it("builds Trustless Work viewer URLs from contract ids", () => {
    expect(buildViewerUrl("CONTRACT123", "https://viewer.trustlesswork.com")).toBe(
      "https://viewer.trustlesswork.com/escrow/CONTRACT123",
    );
  });
});

describe("TrustlessWorkClient", () => {
  it("defaults real Trustless Work calls to the testnet API base", async () => {
    const originalBaseUrl = process.env.TRUSTLESS_WORK_API_BASE_URL;
    const originalApiKey = process.env.TRUSTLESS_WORK_API_KEY;
    process.env.TRUSTLESS_WORK_API_BASE_URL = "";
    process.env.TRUSTLESS_WORK_API_KEY = "secret-key";

    const fetcher = vi.fn(async () => new Response(JSON.stringify([{ contractId: "CONTRACT123" }]), { status: 200 }));
    const client = createTrustlessWorkClientFromEnv(fetcher);

    await client.getEscrowsByContractIds(["CONTRACT123"]);

    expect(fetcher).toHaveBeenCalledWith(
      "https://dev.api.trustlesswork.com/helper/get-escrow-by-contract-ids?contractIds=CONTRACT123&validateOnChain=true",
      expect.any(Object),
    );

    if (originalBaseUrl === undefined) delete process.env.TRUSTLESS_WORK_API_BASE_URL;
    else process.env.TRUSTLESS_WORK_API_BASE_URL = originalBaseUrl;
    if (originalApiKey === undefined) delete process.env.TRUSTLESS_WORK_API_KEY;
    else process.env.TRUSTLESS_WORK_API_KEY = originalApiKey;
  });

  it("uses x-api-key server-side and normalizes unsigned transactions", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ unsignedTransaction: "AAAA_UNSIGNED_XDR" }), { status: 200 }),
    );
    const client = new TrustlessWorkClient({
      apiBaseUrl: "https://api.trustlesswork.com",
      apiKey: "secret-key",
      fetcher,
    });

    const result = await client.initializeMultiReleaseEscrow({
      signer: "G_SIGNER",
      engagementId: "openlab-test",
      title: "Test",
      description: "Test escrow",
      roles: {
        approver: "G_APPROVER",
        serviceProvider: "G_PROVIDER",
        platformAddress: "G_PLATFORM",
        releaseSigner: "G_RELEASE",
        disputeResolver: "G_RESOLVER",
      },
      platformFee: 0,
      milestones: [{ description: "First milestone", amount: 1, receiver: "G_PROVIDER" }],
      trustline: addresses.trustline,
    });

    expect(result.unsignedTransaction).toBe("AAAA_UNSIGNED_XDR");
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.trustlesswork.com/deployer/multi-release",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-api-key": "secret-key",
        }),
      }),
    );
  });

  it("queries canonical escrow state by contract id", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([{ contractId: "CONTRACT123" }]), { status: 200 }));
    const client = new TrustlessWorkClient({
      apiBaseUrl: "https://api.trustlesswork.com/",
      apiKey: "secret-key",
      fetcher,
    });

    const result = await client.getEscrowsByContractIds(["CONTRACT123"]);

    expect(result).toEqual([{ contractId: "CONTRACT123" }]);
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.trustlesswork.com/helper/get-escrow-by-contract-ids?contractIds=CONTRACT123&validateOnChain=true",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "x-api-key": "secret-key" }),
      }),
    );
  });

  it("uses current multi-release release endpoint", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ unsignedTransaction: "AAAA_UNSIGNED_XDR" }), { status: 200 }),
    );
    const client = new TrustlessWorkClient({
      apiBaseUrl: "https://dev.api.trustlesswork.com",
      apiKey: "secret-key",
      fetcher,
    });

    await client.releaseMilestone({
      contractId: "CONTRACT123",
      milestoneIndex: "0",
      releaseSigner: "G_RELEASE",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://dev.api.trustlesswork.com/escrow/multi-release/release-milestone-funds",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("queries Trustless Work discovery helpers by role and signer", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([{ contractId: "CONTRACT123" }]), { status: 200 }));
    const client = new TrustlessWorkClient({
      apiBaseUrl: "https://dev.api.trustlesswork.com",
      apiKey: "secret-key",
      fetcher,
    });

    await client.getEscrowsByRole({ role: "serviceProvider", address: "G_PROVIDER", type: "multi-release" });
    await client.getEscrowsBySigner({ signer: "G_SIGNER", type: "multi-release" });

    expect(fetcher).toHaveBeenCalledWith(
      "https://dev.api.trustlesswork.com/helper/get-escrows-by-role?role=serviceProvider&address=G_PROVIDER&type=multi-release",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://dev.api.trustlesswork.com/helper/get-escrows-by-signer?signer=G_SIGNER&type=multi-release",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("requests indexer refresh from a transaction hash", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ updated: true }), { status: 200 }));
    const client = new TrustlessWorkClient({
      apiBaseUrl: "https://dev.api.trustlesswork.com",
      apiKey: "secret-key",
      fetcher,
    });

    await client.updateFromTransactionHash({ txHash: "TX_HASH" });

    expect(fetcher).toHaveBeenCalledWith(
      "https://dev.api.trustlesswork.com/indexer/update-from-txHash",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ txHash: "TX_HASH" }),
      }),
    );
  });
});
