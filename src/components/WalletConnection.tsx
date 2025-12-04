import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedWalletSelectionModal } from '@/components/wallet/EnhancedWalletSelectionModal';
import { WalletType } from '@/types/wallet';

interface WalletConnectionProps {
  className?: string;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ className }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    connecting, 
    connectWallet, 
    switchToXDCNetwork,
    disconnectWallet 
  } = useWeb3();

  const handleWalletSelect = async (walletType: WalletType) => {
    setWalletModalOpen(false);
    await connectWallet(walletType);
  };

  if (!isConnected) {
    return (
      <div className={cn("space-y-2", className)}>
        <Button
          onClick={() => setWalletModalOpen(true)}
          disabled={connecting}
          className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        
        <EnhancedWalletSelectionModal
          open={walletModalOpen}
          onOpenChange={setWalletModalOpen}
          onWalletSelect={handleWalletSelect}
          connecting={connecting}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="group flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-lg hover:bg-sidebar-accent/80 transition-colors relative">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <span className="text-sm text-sidebar-foreground font-mono flex-1">
          {account?.substring(0, 6)}...{account?.substring(38)}
        </span>
        <button
          onClick={disconnectWallet}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-sidebar-background rounded text-muted-foreground hover:text-foreground"
          title="Disconnect wallet"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      {!isCorrectNetwork && (
        <Button
          onClick={switchToXDCNetwork}
          variant="outline"
          size="sm"
          className="w-full text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          Switch to XDC
        </Button>
      )}
      
      {isCorrectNetwork && (
        <Badge variant="default" className="w-full justify-center text-xs">
          XDC Network
        </Badge>
      )}
    </div>
  );
};