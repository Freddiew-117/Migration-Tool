import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWeb3 } from '@/contexts/Web3Context';
import { User, Wallet } from 'lucide-react';

export const PersonalizedHeader: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { account, isConnected } = useWeb3();

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (profileLoading) {
    return (
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 flex items-center gap-4">
      <Avatar className="h-12 w-12 border-2 border-primary/20">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, {getUserDisplayName()}
          </h1>
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          <p className="text-lg">
            Your personalized Circularity Finance dashboard
          </p>
          
          {account && (
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4" />
              <span className="font-mono">
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};