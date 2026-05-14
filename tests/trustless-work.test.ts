import { describe, expect, it, vi } from "vitest";

import { findExperimentBySlug } from "@/lib/experiments";
import { TrustlessWorkClient } from "@/lib/trustless-work/client";
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
  it("can create deterministic demo unsigned transactions without an API key", async () => {
    const client = new TrustlessWorkClient({
      apiBaseUrl: "https://api.trustlesswork.com",
      demoMode: true,
    });

    const result = await client.fundEscrow({ contractId: "CONTRACT123", signer: "G_SIGNER", amount: "1000" });

    expect(result.unsignedTransaction).toContain("OPENLAB_DEMO_UNSIGNED_XDR");
    expect(result.raw).toEqual(expect.objectContaining({ mode: "demo" }));
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
});
