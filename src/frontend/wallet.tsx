"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type WalletContextValue = {
  address?: string;
  walletName?: string;
  isConnected: boolean;
  error?: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signTransaction: (unsignedXdr: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);
type SupportedWallet = { id: string; name: string };
type WalletKit = {
  openModal: (params: {
    modalTitle?: string;
    notAvailableText?: string;
    onWalletSelected: (option: SupportedWallet) => void;
    onClosed?: () => void;
  }) => Promise<void>;
  setWallet: (id: string) => void;
  getAddress: () => Promise<{ address: string }>;
  signTransaction: (
    xdr: string,
    opts: { networkPassphrase: string; address: string },
  ) => Promise<{ signedTxXdr: string; signerAddress?: string }>;
  disconnect: () => Promise<void>;
};
let walletKitPromise: Promise<{ kit: WalletKit; testnetPassphrase: string }> | undefined;

async function loadWalletKit() {
  if (typeof window === "undefined") {
    throw new Error("Stellar wallets are only available in the browser.");
  }

  walletKitPromise ??= (async () => {
    const [
      kitModule,
      ledgerModule,
      walletConnectModule,
    ] = await Promise.all([
      import("@creit.tech/stellar-wallets-kit"),
      import("@creit.tech/stellar-wallets-kit/modules/ledger.module"),
      import("@creit.tech/stellar-wallets-kit/modules/walletconnect.module"),
    ]);

    const kit = new kitModule.StellarWalletsKit({
      network: kitModule.WalletNetwork.TESTNET,
      selectedWalletId: kitModule.FREIGHTER_ID,
      modalTheme: {
        bgColor: "#151515",
        textColor: "#a9a9a9",
        solidTextColor: "#f4f4f4",
        headerButtonColor: "#8b8b8b",
        dividerColor: "#3a3a3a",
        helpBgColor: "#191919",
        notAvailableTextColor: "#c7c7c7",
        notAvailableBgColor: "#2a2a2a",
        notAvailableBorderColor: "#343434",
      },
      modules: [
        new kitModule.FreighterModule(),
        new kitModule.AlbedoModule(),
        new walletConnectModule.WalletConnectModule({
          url: window.location.origin,
          projectId: "fa57d523d12455e4fc2c8c83c94ec7b1",
          method: walletConnectModule.WalletConnectAllowedMethods.SIGN,
          description: "EcoProof experiment escrow on Trustless Work",
          name: "EcoProof",
          icons: [`${window.location.origin}/images/ecoproof-logo.png`],
          network: kitModule.WalletNetwork.TESTNET,
        }),
        new kitModule.xBullModule(),
        new ledgerModule.LedgerModule(),
        new kitModule.LobstrModule(),
      ],
    });

    return { kit: kit as WalletKit, testnetPassphrase: kitModule.WalletNetwork.TESTNET };
  })();

  return walletKitPromise;
}

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
  const [walletName, setWalletName] = useState<string>();
  const [error, setError] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);

  async function connectWallet() {
    setError(undefined);
    setIsConnecting(true);

    try {
      const { kit } = await loadWalletKit();
      await new Promise<void>((resolve, reject) => {
        void kit.openModal({
          modalTitle: "Connect to your favorite wallet",
          notAvailableText: "Not available",
          onWalletSelected: (option: SupportedWallet) => {
            void (async () => {
              try {
                kit.setWallet(option.id);
                const result = await kit.getAddress();
                if (!result.address) throw new Error(`${option.name} did not return a wallet address.`);
                setAddress(result.address);
                setWalletName(option.name);
                setError(undefined);
                resolve();
              } catch (selectionError) {
                reject(selectionError);
              }
            })();
          },
          onClosed: () => {
            resolve();
          },
        }).catch(reject);
      });
    } catch (nextError) {
      setAddress(undefined);
      setWalletName(undefined);
      setError(freighterErrorMessage(nextError));
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnectWallet() {
    const { kit } = await loadWalletKit();
    await kit.disconnect();
    setAddress(undefined);
    setWalletName(undefined);
    setError(undefined);
  }

  async function signTransaction(unsignedXdr: string) {
    if (!address) throw new Error("Connect a wallet before signing");

    const { kit, testnetPassphrase } = await loadWalletKit();
    const signed = await kit.signTransaction(unsignedXdr, {
      networkPassphrase: testnetPassphrase,
      address,
    });
    if (!signed.signedTxXdr) throw new Error("The selected wallet did not return a signed transaction XDR");
    return signed.signedTxXdr;
  }

  const value = useMemo(
    () => ({
      address,
      walletName,
      isConnected: Boolean(address),
      error,
      isConnecting,
      connectWallet,
      disconnectWallet,
      signTransaction,
    }),
    [address, walletName, error, isConnecting],
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
