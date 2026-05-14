import { afterEach, describe, expect, it } from "vitest";

import { resolveCreateEscrowConfig } from "@/lib/openlab-config";

const previousEnv = { ...process.env };

describe("OpenLab config helpers", () => {
  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it("defaults platform, release signer, dispute resolver, and USDC trustline from env", () => {
    process.env.OPENLAB_PLATFORM_ADDRESS = "G_PLATFORM_ENV";
    process.env.OPENLAB_RELEASE_SIGNER_ADDRESS = "G_RELEASE_ENV";
    process.env.OPENLAB_DISPUTE_RESOLVER_ADDRESS = "G_RESOLVER_ENV";
    process.env.OPENLAB_USDC_TRUSTLINE_ADDRESS = "C_USDC_ENV";

    const config = resolveCreateEscrowConfig({
      experimentSlug: "waterwatch-costa-rica",
      signer: "G_SIGNER",
      serviceProvider: "G_TEAM",
      approver: "G_APPROVER",
    });

    expect(config.platformAddress).toBe("G_PLATFORM_ENV");
    expect(config.releaseSigner).toBe("G_RELEASE_ENV");
    expect(config.disputeResolver).toBe("G_RESOLVER_ENV");
    expect(config.trustline).toEqual({ address: "C_USDC_ENV", symbol: "USDC" });
  });

  it("throws a helpful error when server defaults are missing", () => {
    delete process.env.OPENLAB_PLATFORM_ADDRESS;
    delete process.env.OPENLAB_RELEASE_SIGNER_ADDRESS;
    delete process.env.OPENLAB_DISPUTE_RESOLVER_ADDRESS;
    delete process.env.OPENLAB_USDC_TRUSTLINE_ADDRESS;

    expect(() =>
      resolveCreateEscrowConfig({
        experimentSlug: "waterwatch-costa-rica",
        signer: "G_SIGNER",
        serviceProvider: "G_TEAM",
        approver: "G_APPROVER",
      }),
    ).toThrow(/OPENLAB_PLATFORM_ADDRESS/);
  });
});
