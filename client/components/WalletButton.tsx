import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle2 } from 'lucide-react';

interface WalletButtonProps {
  onConnect?: (connected: boolean, publicKey: string | null) => void;
}

export const WalletButton: FC<WalletButtonProps> = ({ onConnect }) => {
  const { wallet, publicKey, connected, connecting, disconnect, select, wallets } = useWallet();
  const [showWallets, setShowWallets] = useState(false);

  // Notify parent component of connection status changes
  useEffect(() => {
    onConnect?.(connected, publicKey?.toString() || null);
  }, [connected, publicKey, onConnect]);

  const handleConnect = async () => {
    try {
      if (connected) {
        await disconnect();
      } else {
        // Try to find Phantom first, fallback to first available wallet
        const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
        const walletToUse = phantomWallet || wallets[0];

        if (walletToUse) {
          console.log('Selecting wallet:', walletToUse.adapter.name);
          select(walletToUse.adapter.name);
        } else {
          console.error('No wallets available');
          alert('Please install a Solana wallet like Phantom from https://phantom.app');
        }
      }
    } catch (error: any) {
      // Handle user rejection gracefully
      if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
        console.log('User cancelled wallet connection');
        return;
      }

      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please make sure your wallet is unlocked and try again.');
    }
  };

  if (connected && publicKey) {
    return (
      <Button
        onClick={handleConnect}
        variant="outline"
        className="bg-cyber-green/20 border-cyber-green text-cyber-green hover:bg-cyber-green/30"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      className="bg-cyber-pink hover:bg-cyber-pink/80"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};
