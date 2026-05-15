"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type FreighterApi = {
  isConnected?: () => Promise<boolean> | boolean;
  requestAccess?: () => Promise<string>;
  getAddress?: () => Promise<{ address?: string } | string>;
  signTransaction?: (
    xdr: string,
    options?: { networkPassphrase?: string; address?: string },
  ) => Promise<string | { signedTxXdr?: string; signerAddress?: string; error?: string }>;
};

type WalletContextValue = {
  address?: string;
  isConnected: boolean;
  error?: string;
  connectWallet: () => Promise<void>;
  useManualWallet: (address: string) => void;
  signTransaction: (unsignedXdr: string) => Promise<string>;
};

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [error, setError] = useState<string>();

  async function connectWallet() {
    setError(undefined);
    const freighter = window.freighterApi;
    if (!freighter) {
      setError("Freighter wallet was not detected. Paste a testnet address for read-only role preview.");
      return;
    }

    const requested = await freighter.requestAccess?.();
    const resolved = requested ?? (await freighter.getAddress?.());
    const nextAddress = typeof resolved === "string" ? resolved : resolved?.address;
    if (!nextAddress) throw new Error("Freighter did not return a wallet address");
    setAddress(nextAddress);
  }

  function useManualWallet(nextAddress: string) {
    setError(undefined);
    setAddress(nextAddress.trim() || undefined);
  }

  async function signTransaction(unsignedXdr: string) {
    if (!address) throw new Error("Connect a wallet before signing");

    if (window.freighterApi?.signTransaction) {
      const signed = await window.freighterApi.signTransaction(unsignedXdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
        address,
      });
      if (typeof signed === "string") return signed;
      if (signed.error) throw new Error(signed.error);
      if (!signed.signedTxXdr) throw new Error("Freighter did not return a signed transaction XDR");
      return signed.signedTxXdr;
    }

    throw new Error("A wallet signer is required for real testnet transactions");
  }

  const value = useMemo(
    () => ({
      address,
      isConnected: Boolean(address),
      error,
      connectWallet,
      useManualWallet,
      signTransaction,
    }),
    [address, error],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}

export function shortWallet(address?: string) {
  if (!address) return "No wallet";
  return address.length <= 14 ? address : `${address.slice(0, 6)}...${address.slice(-6)}`;
}
