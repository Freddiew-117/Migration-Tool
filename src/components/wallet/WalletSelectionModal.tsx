import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WalletConfig, WalletType } from '@/types/wallet';
import { MetaMaskProvider } from '@/providers/MetaMaskProvider';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import { Loader2 } from 'lucide-react';

interface WalletSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletSelect: (walletType: WalletType) => void;
  connecting: boolean;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  open,
  onOpenChange,
  onWalletSelect,
  connecting
}) => {
  const [availableWallets, setAvailableWallets] = useState<WalletConfig[]>([]);

  const walletConfigs: WalletConfig[] = [
    {
      type: 'metamask',
      name: 'MetaMask',
      logo: '/image-uploads/metamask-logo.svg',
      category: 'popular'
    },
    {
      type: 'walletconnect',
      name: 'WalletConnect',
      logo: '/image-uploads/walletconnect-logo.svg',
      category: 'popular'
    }
  ];

  useEffect(() => {
    const checkWalletAvailability = async () => {
      const metamask = new MetaMaskProvider();
      const walletconnect = new WalletConnectProvider();
      
      const available = [];
      
      if (await metamask.isAvailable()) {
        available.push(walletConfigs.find(w => w.type === 'metamask')!);
      }
      
      // WalletConnect is always available
      if (await walletconnect.isAvailable()) {
        available.push(walletConfigs.find(w => w.type === 'walletconnect')!);
      }
      
      setAvailableWallets(available);
    };

    if (open) {
      checkWalletAvailability();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {availableWallets.map((wallet) => (
            <Button
              key={wallet.type}
              variant="outline"
              className="w-full h-16 flex items-center justify-start gap-4 px-4"
              onClick={() => onWalletSelect(wallet.type)}
              disabled={connecting}
            >
              {connecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <img 
                  src={wallet.logo} 
                  alt={wallet.name}
                  className="w-8 h-8"
                />
              )}
              <span className="text-lg font-medium">{wallet.name}</span>
            </Button>
          ))}
          
          {availableWallets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No wallets available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please install MetaMask or use a WalletConnect compatible wallet
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};