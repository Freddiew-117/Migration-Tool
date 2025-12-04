import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Wallet, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { cn } from '@/lib/utils';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SwapMode = 'BUY' | 'SELL';
type TokenType = 'CIFI' | 'REFI';

export const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose }) => {
  const { isConnected, isCorrectNetwork, account } = useWeb3();
  const { data: balances, isLoading: balancesLoading } = useTokenBalances();
  
  const [swapMode, setSwapMode] = useState<SwapMode>('BUY');
  const [selectedToken, setSelectedToken] = useState<TokenType>('CIFI');
  const [amount, setAmount] = useState('');
  const [isTransacting, setIsTransacting] = useState(false);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const handleSwapModeToggle = () => {
    setSwapMode(swapMode === 'BUY' ? 'SELL' : 'BUY');
    setAmount('');
  };

  const getTokenBalance = (token: TokenType) => {
    if (!balances) return '0';
    return token === 'CIFI' ? balances.cifi : balances.refi;
  };

  const handleSwap = async () => {
    if (!isConnected || !isCorrectNetwork) return;
    
    setIsTransacting(true);
    try {
      // Placeholder for future contract integration
      console.log(`${swapMode} ${amount} ${selectedToken}`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onClose();
    } catch (error) {
      console.error('Swap error:', error);
    } finally {
      setIsTransacting(false);
    }
  };

  const isSwapDisabled = !amount || !isConnected || !isCorrectNetwork || isTransacting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center">
            <ArrowUpDown className="w-5 h-5" />
            Swap Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Swap Mode Toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={swapMode === 'BUY' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSwapMode('BUY')}
              className="flex-1"
            >
              BUY
            </Button>
            <Button
              variant={swapMode === 'SELL' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSwapMode('SELL')}
              className="flex-1"
            >
              SELL
            </Button>
          </div>

          {/* From Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">From</span>
                {swapMode === 'BUY' && (
                  <span className="text-xs text-muted-foreground">
                    Balance: USDC (Connect wallet)
                  </span>
                )}
                {swapMode === 'SELL' && (
                  <span className="text-xs text-muted-foreground">
                    Balance: {balancesLoading ? '...' : formatBalance(getTokenBalance(selectedToken))} {selectedToken}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                
                {swapMode === 'BUY' ? (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md min-w-[80px]">
                    <span className="font-medium">USDC</span>
                  </div>
                ) : (
                  <Select value={selectedToken} onValueChange={(value: TokenType) => setSelectedToken(value)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIFI">CIFI</SelectItem>
                      <SelectItem value="REFI">REFI</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapModeToggle}
              className="rounded-full w-10 h-10 p-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">To</span>
                {swapMode === 'SELL' && (
                  <span className="text-xs text-muted-foreground">
                    Balance: USDC (Connect wallet)
                  </span>
                )}
                {swapMode === 'BUY' && (
                  <span className="text-xs text-muted-foreground">
                    Balance: {balancesLoading ? '...' : formatBalance(getTokenBalance(selectedToken))} {selectedToken}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {amount ? (parseFloat(amount) * 1).toFixed(4) : '0.0'}
                  </span>
                </div>
                
                {swapMode === 'SELL' ? (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md min-w-[80px]">
                    <span className="font-medium">USDC</span>
                  </div>
                ) : (
                  <Select value={selectedToken} onValueChange={(value: TokenType) => setSelectedToken(value)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIFI">CIFI</SelectItem>
                      <SelectItem value="REFI">REFI</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Status */}
          {!isConnected && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Connect wallet to continue</span>
            </div>
          )}

          {isConnected && !isCorrectNetwork && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">Switch to XDC Network</span>
            </div>
          )}

          {/* Transaction Preview */}
          {amount && isConnected && isCorrectNetwork && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>1 USDC = 1 {selectedToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <Badge variant="secondary" className="text-xs">XDC Network</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={isSwapDisabled}
            className="w-full"
            size="lg"
          >
            {isTransacting ? (
              'Processing...'
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !isCorrectNetwork ? (
              'Switch to XDC Network'
            ) : (
              `${swapMode} ${selectedToken}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};