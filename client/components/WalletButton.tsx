import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { CustomWalletModal } from './CustomWalletModal';
import { Wallet, CheckCircle2 } from 'lucide-react';

interface WalletButtonProps {
  onConnect?: (connected: boolean, publicKey: string | null) => void;
}

export const WalletButton: FC<WalletButtonProps> = ({ onConnect }) => {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  // Notify parent component of connection status changes
  useEffect(() => {
    onConnect?.(connected, publicKey?.toString() || null);
  }, [connected, publicKey, onConnect]);

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setShowModal(true);
    }
  };

  if (connected && publicKey) {
    return (
      <>
        <Button
          onClick={handleClick}
          variant="outline"
          className="bg-cyber-green/20 border-cyber-green text-cyber-green hover:bg-cyber-green/30"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </Button>
        <CustomWalletModal
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={connecting}
        className="bg-cyber-pink hover:bg-cyber-pink/80"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      <CustomWalletModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
