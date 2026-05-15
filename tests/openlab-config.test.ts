import { describe, expect, it } from "vitest";

import { resolveCreateEscrowConfig } from "@/lib/openlab-config";

describe("OpenLab config helpers", () => {
  it("defaults role fallbacks from the connected wallets and the real testnet USDC trustline", () => {
    const config = resolveCreateEscrowConfig({
      experimentSlug: "waterwatch-costa-rica",
      signer: "G_SIGNER",
      serviceProvider: "G_TEAM",
      approver: "G_APPROVER",
    });

    expect(config.platformAddress).toBe("G_SIGNER");
    expect(config.releaseSigner).toBe("G_APPROVER");
    expect(config.disputeResolver).toBe("G_APPROVER");
    expect(config.trustline).toEqual({
      address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      symbol: "USDC",
    });
  });

  it("keeps explicit role and trustline overrides from the request", () => {
    const config = resolveCreateEscrowConfig({
      experimentSlug: "waterwatch-costa-rica",
      signer: "G_SIGNER",
      serviceProvider: "G_TEAM",
      approver: "G_APPROVER",
      platformAddress: "G_PLATFORM",
      releaseSigner: "G_RELEASE",
      disputeResolver: "G_RESOLVER",
      trustline: { address: "C_USDC", symbol: "USDC" },
    });

    expect(config.platformAddress).toBe("G_PLATFORM");
    expect(config.releaseSigner).toBe("G_RELEASE");
    expect(config.disputeResolver).toBe("G_RESOLVER");
    expect(config.trustline).toEqual({ address: "C_USDC", symbol: "USDC" });
  });
});
