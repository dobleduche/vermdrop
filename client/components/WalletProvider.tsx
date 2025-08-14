import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Note: Wallet adapter CSS will be handled via CDN or manual styling

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Configure network (devnet for testing, switch to mainnet for production)
  const network = WalletAdapterNetwork.Devnet;

  // Configure endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure wallets - simplified list
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  const onError = (error: any) => {
    console.error('Wallet error:', error);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={false}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
