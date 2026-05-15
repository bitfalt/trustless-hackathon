"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  WatchWalletChanges,
  getNetwork,
  isConnected as isFreighterConnected,
  requestAccess,
  signTransaction as signFreighterTransaction,
} from "@stellar/freighter-api";

type WalletContextValue = {
  address?: string;
  isConnected: boolean;
  error?: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  signTransaction: (unsignedXdr: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

function freighterErrorMessage(error: unknown) {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Freighter returned an unexpected error";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [error, setError] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const watcher = new WatchWalletChanges(1000);
    const result = watcher.watch((next) => {
      const nextError = freighterErrorMessage(next.error);
      if (nextError) {
        setError(nextError);
        return;
      }
      setAddress(next.address || undefined);
      if (next.network && next.network !== "TESTNET") {
        setError("Switch Freighter to TESTNET before using EcoProof.");
      } else {
        setError(undefined);
      }
    });
    const watchError = freighterErrorMessage(result.error);
    if (watchError) setError(watchError);
    return () => watcher.stop();
  }, []);

  async function connectWallet() {
    setError(undefined);
    setIsConnecting(true);

    try {
      const connected = await isFreighterConnected();
      if (connected.error) throw new Error(freighterErrorMessage(connected.error));
      if (!connected.isConnected) {
        throw new Error("Freighter was not detected. Install the Freighter extension, unlock it, and refresh EcoProof.");
      }

      const network = await getNetwork();
      if (network.error) throw new Error(freighterErrorMessage(network.error));
      if (network.network !== "TESTNET") {
        throw new Error("Switch Freighter to TESTNET before using EcoProof.");
      }

      const access = await requestAccess();
      if (access.error) throw new Error(freighterErrorMessage(access.error));
      if (!access.address) throw new Error("Freighter did not return a wallet address. Unlock Freighter and approve access.");
      setAddress(access.address);
    } catch (nextError) {
      setAddress(undefined);
      setError(freighterErrorMessage(nextError));
    } finally {
      setIsConnecting(false);
    }
  }

  async function signTransaction(unsignedXdr: string) {
    if (!address) throw new Error("Connect a wallet before signing");

    const signed = await signFreighterTransaction(unsignedXdr, {
      networkPassphrase: TESTNET_PASSPHRASE,
      address,
    });
    if (signed.error) throw new Error(freighterErrorMessage(signed.error));
    if (!signed.signedTxXdr) throw new Error("Freighter did not return a signed transaction XDR");
    return signed.signedTxXdr;
  }

  const value = useMemo(
    () => ({
      address,
      isConnected: Boolean(address),
      error,
      isConnecting,
      connectWallet,
      signTransaction,
    }),
    [address, error, isConnecting],
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
