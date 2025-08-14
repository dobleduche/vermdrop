import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Note: Wallet adapter CSS will be handled via CDN or manual styling

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Configure network for mainnet
  const network = WalletAdapterNetwork.Mainnet;

  // Configure endpoint - use Helius RPC if available, fallback to default
  const endpoint = useMemo(() => {
    const heliusRpc = import.meta.env.VITE_HELIUS_RPC_URL;
    if (heliusRpc) {
      console.log("Using Helius RPC:", heliusRpc);
      return heliusRpc;
    }
    console.log("Using default RPC for network:", network);
    return clusterApiUrl(network);
  }, [network]);

  // Configure wallets - minimal list for better compatibility
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  const onError = (error: any) => {
    // Handle user rejection gracefully - this is normal behavior
    if (
      error?.message?.includes("User rejected") ||
      error?.message?.includes("rejected")
    ) {
      console.log("User cancelled wallet connection");
      return;
    }

    // Log other errors but don't throw
    console.error("Wallet error:", error);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={true}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
