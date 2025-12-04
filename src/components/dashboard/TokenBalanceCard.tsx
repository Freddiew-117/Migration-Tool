import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Coins } from 'lucide-react';

interface TokenBalanceCardProps {
  tokenSymbol: string;
  balance: string;
  loading: boolean;
  icon?: React.ReactNode;
}

export const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({
  tokenSymbol,
  balance,
  loading,
  icon = <Coins className="h-4 w-4" />
}) => {
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium">
          {tokenSymbol} V2 Balance
        </CardTitle>
        <div className="flex items-center gap-2">
          {icon}
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {formatBalance(balance)}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {tokenSymbol}
            </span>
          </div>
        )}
        <CardDescription className="flex items-center gap-1 mt-2">
          <TrendingUp className="h-3 w-3 text-primary" />
          Real-time balance from XDC Network
        </CardDescription>
      </CardContent>
    </Card>
  );
};