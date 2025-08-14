import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Wallet } from 'lucide-react';

interface CustomWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export const CustomWalletModal: FC<CustomWalletModalProps> = ({ open, onClose }) => {
  const { wallets, select, connecting } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      setConnectingWallet(walletName);
      select(walletName);
      // Close modal after selection
      setTimeout(() => {
        onClose();
        setConnectingWallet(null);
      }, 1000);
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectingWallet(null);
    }
  };

  // Filter to only show installed or popular wallets
  const availableWallets = wallets.filter(wallet => 
    wallet.readyState === 'Installed' || 
    ['Phantom', 'Solflare', 'Torus'].includes(wallet.adapter.name)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-cyber-dark border-cyber-neon">
        <DialogHeader>
          <DialogTitle className="text-cyber-light text-center flex items-center justify-center">
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {availableWallets.map((wallet) => (
            <Button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              disabled={connecting || connectingWallet === wallet.adapter.name}
              className="w-full justify-start bg-cyber-darker border border-cyber-neon/20 hover:border-cyber-neon/40 hover:bg-cyber-darker/80 text-cyber-light"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                {wallet.adapter.icon && (
                  <img 
                    src={wallet.adapter.icon} 
                    alt={`${wallet.adapter.name} icon`}
                    className="w-6 h-6"
                  />
                )}
                <span className="font-medium">{wallet.adapter.name}</span>
                {connectingWallet === wallet.adapter.name && (
                  <span className="text-xs text-cyber-blue">Connecting...</span>
                )}
              </div>
            </Button>
          ))}
          
          {availableWallets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-cyber-light/60 mb-4">No wallets detected</p>
              <div className="space-y-2 text-sm text-cyber-light/40">
                <p>Please install a Solana wallet:</p>
                <div className="space-y-1">
                  <a 
                    href="https://phantom.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-cyber-blue hover:text-cyber-blue/80"
                  >
                    • Download Phantom
                  </a>
                  <a 
                    href="https://solflare.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-cyber-blue hover:text-cyber-blue/80"
                  >
                    • Download Solflare
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
