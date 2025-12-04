import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Wifi, AlertCircle, CheckCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { EnhancedWalletSelectionModal } from '@/components/wallet/EnhancedWalletSelectionModal';
import { WalletType } from '@/types/wallet';

export const WalletStatusCard: React.FC = () => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    connecting, 
    connectWallet, 
    switchToXDCNetwork 
  } = useWeb3();

  const handleWalletSelect = async (walletType: WalletType) => {
    setWalletModalOpen(false);
    await connectWallet(walletType);
  };

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
        status: 'Not Connected',
        description: 'Connect your wallet to view your tokens',
        variant: 'outline' as const,
        action: (
          <Button 
            onClick={() => setWalletModalOpen(true)} 
            disabled={connecting}
            size="sm"
            className="w-full mt-2"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )
      };
    }

    if (!isCorrectNetwork) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
        status: 'Wrong Network',
        description: `Connected to wrong network. Switch to XDC Network.`,
        variant: 'destructive' as const,
        action: (
          <Button 
            onClick={switchToXDCNetwork}
            size="sm"
            variant="outline"
            className="w-full mt-2"
          >
            Switch to XDC
          </Button>
        )
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4 text-primary" />,
      status: 'Connected',
      description: `Connected to XDC Network`,
      variant: 'default' as const,
      action: null
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Wallet Status
        </CardTitle>
        <Wifi className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <Badge variant={statusInfo.variant}>
              {statusInfo.status}
            </Badge>
          </div>
        </div>
        
        {account && (
          <div className="text-sm font-mono text-muted-foreground mb-2">
            {account.substring(0, 6)}...{account.substring(38)}
          </div>
        )}
        
        <CardDescription>
          {statusInfo.description}
        </CardDescription>
        
        {statusInfo.action}
        
        <EnhancedWalletSelectionModal
          open={walletModalOpen}
          onOpenChange={setWalletModalOpen}
          onWalletSelect={handleWalletSelect}
          connecting={connecting}
        />
      </CardContent>
    </Card>
  );
};