import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { WalletConfig, WalletType } from '@/types/wallet';
import { MetaMaskProvider } from '@/providers/MetaMaskProvider';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import { CoinbaseProvider } from '@/providers/CoinbaseProvider';
import { DCentProvider } from '@/providers/DCentProvider';
import { Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EnhancedWalletSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletSelect: (walletType: WalletType) => void;
  connecting: boolean;
}

export const EnhancedWalletSelectionModal: React.FC<EnhancedWalletSelectionModalProps> = ({
  open,
  onOpenChange,
  onWalletSelect,
  connecting
}) => {
  const [availableWallets, setAvailableWallets] = useState<(WalletConfig & { isAvailable: boolean })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'mobile' | 'hardware' | 'browser'>('all');

  const walletConfigs: WalletConfig[] = [
    {
      type: 'metamask',
      name: 'MetaMask',
      logo: '/image-uploads/metamask-logo.svg',
      description: 'Connect using browser extension',
      category: 'popular',
      isInstallable: true,
      downloadUrl: 'https://metamask.io/download/'
    },
    {
      type: 'walletconnect',
      name: 'WalletConnect',
      logo: '/image-uploads/walletconnect-logo.svg',
      description: 'Scan with WalletConnect to connect',
      category: 'popular'
    },
    {
      type: 'coinbase',
      name: 'Coinbase Wallet',
      logo: '/image-uploads/coinbase-logo.svg',
      description: 'Connect using Coinbase Wallet',
      category: 'popular',
      isInstallable: true,
      downloadUrl: 'https://www.coinbase.com/wallet'
    },
    {
      type: 'dcent',
      name: "D'CENT",
      logo: '/image-uploads/dcent-logo.svg',
      description: 'Hardware wallet with mobile app',
      category: 'hardware'
    }
  ];

  useEffect(() => {
    const checkWalletAvailability = async () => {
      const metamask = new MetaMaskProvider();
      const walletconnect = new WalletConnectProvider();
      const coinbase = new CoinbaseProvider();
      const dcent = new DCentProvider();
      
      const providers = { metamask, walletconnect, coinbase, dcent };
      
      const walletsWithAvailability = await Promise.all(
        walletConfigs.map(async (wallet) => ({
          ...wallet,
          isAvailable: await providers[wallet.type].isAvailable()
        }))
      );
      
      setAvailableWallets(walletsWithAvailability);
    };

    if (open) {
      checkWalletAvailability();
    }
  }, [open]);

  const filteredWallets = availableWallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wallet.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || wallet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all' as const, name: 'All Wallets' },
    { id: 'popular' as const, name: 'Popular' },
    { id: 'mobile' as const, name: 'Mobile' },
    { id: 'hardware' as const, name: 'Hardware' }
  ];

  const getWalletStatus = (wallet: WalletConfig & { isAvailable: boolean }) => {
    if (connecting) return 'connecting';
    if (!wallet.isAvailable && wallet.isInstallable) return 'install';
    if (wallet.isAvailable) return 'available';
    return 'unavailable';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-primary/20 text-primary border-primary/30';
      case 'install': return 'bg-secondary text-secondary-foreground border-border';
      case 'connecting': return 'bg-accent/20 text-accent border-accent/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center mb-2">
            <img 
              src="/image-uploads/71c9ed17-aa4f-4226-bf01-ac07e636f9b2.png" 
              alt="Company Logo" 
              className="w-16 h-16"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Connect Your Wallet</DialogTitle>
          
          {/* Search and Categories */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search wallets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Wallet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWallets.map((wallet) => {
              const status = getWalletStatus(wallet);
              
              return (
                <div
                  key={wallet.type}
                  className="relative group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg text-center"
                  onClick={() => {
                    if (status === 'available') {
                      onWalletSelect(wallet.type);
                    } else if (status === 'install' && wallet.downloadUrl) {
                      window.open(wallet.downloadUrl, '_blank');
                    }
                  }}
                >
                  
                  <div className="flex flex-col items-center justify-center gap-3">
                    
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground text-center">{wallet.name}</h3>
                          {status !== 'available' && (
                            <Badge className={`text-xs ${getStatusColor(status)}`}>
                              {status === 'install' && 'Install'}
                              {status === 'connecting' && 'Connecting...'}
                              {status === 'unavailable' && 'Unavailable'}
                            </Badge>
                          )}
                        </div>
                      <p className="text-sm text-muted-foreground text-center">
                        {wallet.description}
                      </p>
                    </div>
                    
                    {status === 'install' && (
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        Install
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWallets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No wallets found matching your search</p>
            </div>
          )}

          {/* What is a wallet section */}
          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-center">
                What is a wallet?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  A crypto wallet is a digital tool that allows you to store, send, and receive cryptocurrency. 
                  It's like a digital bank account for your crypto assets.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div>
                      <p className="text-sm font-medium">Secure</p>
                      <p className="text-xs text-muted-foreground">Your private keys never leave your device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div>
                      <p className="text-sm font-medium">Fast</p>
                      <p className="text-xs text-muted-foreground">Instant connection to decentralized apps</p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
};