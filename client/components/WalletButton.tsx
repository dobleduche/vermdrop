import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle2 } from 'lucide-react';

interface WalletButtonProps {
  onConnect?: (connected: boolean, publicKey: string | null) => void;
}

export const WalletButton: FC<WalletButtonProps> = ({ onConnect }) => {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (connected) {
      disconnect();
      onConnect?.(false, null);
    } else {
      setVisible(true);
    }
  };

  // Notify parent component of connection status changes
  if (onConnect) {
    onConnect(connected, publicKey?.toString() || null);
  }

  if (connected && publicKey) {
    return (
      <Button
        onClick={handleClick}
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
      onClick={handleClick}
      disabled={connecting}
      className="bg-cyber-pink hover:bg-cyber-pink/80"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};
