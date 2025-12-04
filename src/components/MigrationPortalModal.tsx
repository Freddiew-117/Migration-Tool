import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useMigrationContract } from '@/hooks/useMigrationContract';
import { useMigrationEvents } from '@/hooks/useMigrationEvents';
import { useContractData } from '@/hooks/useContractData';
import { MigrationAcknowledgementForm } from '@/components/migration/MigrationAcknowledgementForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Wallet, ArrowRightLeft, TrendingUp, Clock, Shield, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
interface MigrationPortalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const MigrationPortalModal = ({
  open,
  onOpenChange
}: MigrationPortalModalProps) => {
  const {
    account,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    switchToXDCNetwork,
    getTokenBalance,
    getTokenAllowance,
    approveToken
  } = useWeb3();
  const {
    recordMigrationEvent
  } = useMigrationEvents();
  const {
    toast
  } = useToast();
  const { contracts, loading: contractsLoading, error: contractsError } = useContractData();
  const [balances, setBalances] = useState({
    cifiV1: '0',
    cifiV2: '0',
    refiV1: '0',
    refiV2: '0'
  });
  const [migrationAmount, setMigrationAmount] = useState('');
  const [activeTab, setActiveTab] = useState('cifi');
  const [approving, setApproving] = useState(false);
  const [acknowledgementId, setAcknowledgementId] = useState<string | null>(null);
  const [hasCompletedAcknowledgement, setHasCompletedAcknowledgement] = useState(false);
  const cifiMigration = useMigrationContract(contracts.cifiMigration?.address || '');
  const refiMigration = useMigrationContract(contracts.refiMigration?.address || '');
  const currentMigration = activeTab === 'cifi' ? cifiMigration : refiMigration;


  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !contracts.cifiV1 || !open || contractsLoading) return;
      try {
        const [cifiV1Balance, cifiV2Balance, refiV1Balance, refiV2Balance] = await Promise.all([getTokenBalance(contracts.cifiV1.address), getTokenBalance(contracts.cifiV2?.address || ''), getTokenBalance(contracts.refiV1?.address || ''), getTokenBalance(contracts.refiV2?.address || '')]);
        setBalances({
          cifiV1: cifiV1Balance,
          cifiV2: cifiV2Balance,
          refiV1: refiV1Balance,
          refiV2: refiV2Balance
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };
    fetchBalances();
  }, [isConnected, contracts, account, getTokenBalance, open, contractsLoading]);
  const handleApprove = async () => {
    if (!migrationAmount || !isConnected) return;
    const v1Contract = activeTab === 'cifi' ? contracts.cifiV1 : contracts.refiV1;
    const migrationContract = activeTab === 'cifi' ? contracts.cifiMigration : contracts.refiMigration;
    if (!v1Contract || !migrationContract) return;
    setApproving(true);
    try {
      await approveToken(v1Contract.address, migrationContract.address, migrationAmount);
    } finally {
      setApproving(false);
    }
  };
  const handleMigrate = async () => {
    if (!migrationAmount || !currentMigration || !acknowledgementId) return;
    const v1Contract = activeTab === 'cifi' ? contracts.cifiV1 : contracts.refiV1;
    const v2Contract = activeTab === 'cifi' ? contracts.cifiV2 : contracts.refiV2;
    if (!v1Contract || !v2Contract || !account) return;
    try {
      await currentMigration.migrate(migrationAmount);

      // Record migration event (without transaction hash for now)
      await recordMigrationEvent({
        acknowledgementId,
        walletAddress: account,
        tokenType: activeTab.toUpperCase() as 'CIFI' | 'REFI',
        amount: migrationAmount,
        oldContractAddress: v1Contract.address,
        newContractAddress: v2Contract.address
      });
      setMigrationAmount('');
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${migrationAmount} ${activeTab.toUpperCase()} tokens`
      });

      // Refresh balances after migration
      setTimeout(() => {
        const fetchBalances = async () => {
          if (!contracts.cifiV1) return;
          const [cifiV1Balance, cifiV2Balance, refiV1Balance, refiV2Balance] = await Promise.all([getTokenBalance(contracts.cifiV1.address), getTokenBalance(contracts.cifiV2?.address || ''), getTokenBalance(contracts.refiV1?.address || ''), getTokenBalance(contracts.refiV2?.address || '')]);
          setBalances({
            cifiV1: cifiV1Balance,
            cifiV2: cifiV2Balance,
            refiV1: refiV1Balance,
            refiV2: refiV2Balance
          });
        };
        fetchBalances();
      }, 3000);
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    }
  };
  const handleAcknowledgementComplete = (id: string) => {
    setAcknowledgementId(id);
    setHasCompletedAcknowledgement(true);
  };

  // Reset acknowledgement state when modal closes
  useEffect(() => {
    if (!open) {
      setAcknowledgementId(null);
      setHasCompletedAcknowledgement(false);
      setMigrationAmount('');
    }
  }, [open]);

  // Transform contracts for acknowledgement form
  const getAcknowledgementContracts = () => ({
    CIFI: {
      old: contracts.cifiV1?.address || '',
      new: contracts.cifiV2?.address || ''
    },
    REFI: {
      old: contracts.refiV1?.address || '',
      new: contracts.refiV2?.address || ''
    }
  });
  const renderContent = () => {
    if (!isConnected) {
      return <div className="text-center py-8">
          <Wallet className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to access the Migration Portal
          </p>
          <Button onClick={() => connectWallet()}>
            Connect Wallet
          </Button>
        </div>;
    }
    if (!isCorrectNetwork) {
      return <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wrong Network</h3>
          <p className="text-muted-foreground mb-4">
            Please switch to XDC Network to use the Migration Portal
          </p>
          <Button onClick={switchToXDCNetwork}>
            Switch to XDC Network
          </Button>
        </div>;
    }

    // Show acknowledgement form first if not completed
    if (!hasCompletedAcknowledgement) {
      return <div className="max-h-[70vh] overflow-y-auto">
          <MigrationAcknowledgementForm walletAddress={account || ''} contracts={getAcknowledgementContracts()} onAcknowledgementComplete={handleAcknowledgementComplete} />
        </div>;
    }

    // Show migration interface after acknowledgement is completed
    return <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Acknowledgement Status */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Acknowledgement completed successfully. You can now proceed with token migration.
          </AlertDescription>
        </Alert>

        {/* Wallet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Connected Address</p>
                <p className="font-mono text-sm font-medium">
                  {account?.substring(0, 6)}...{account?.substring(38)}
                </p>
              </div>
              <Badge variant="default">XDC Network</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Migration Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cifi" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              CIFI Migration
            </TabsTrigger>
            <TabsTrigger value="refi" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              REFI Migration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cifi" className="space-y-4">
            <MigrationTab tokenType="CIFI" v1Balance={balances.cifiV1} v2Balance={balances.cifiV2} migrationContract={cifiMigration} migrationAmount={migrationAmount} setMigrationAmount={setMigrationAmount} onApprove={handleApprove} onMigrate={handleMigrate} approving={approving} />
          </TabsContent>

          <TabsContent value="refi" className="space-y-4">
            <MigrationTab tokenType="REFI" v1Balance={balances.refiV1} v2Balance={balances.refiV2} migrationContract={refiMigration} migrationAmount={migrationAmount} setMigrationAmount={setMigrationAmount} onApprove={handleApprove} onMigrate={handleMigrate} approving={approving} />
          </TabsContent>
        </Tabs>
      </div>;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden mx-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>;
};
interface MigrationTabProps {
  tokenType: string;
  v1Balance: string;
  v2Balance: string;
  migrationContract: ReturnType<typeof useMigrationContract>;
  migrationAmount: string;
  setMigrationAmount: (amount: string) => void;
  onApprove: () => void;
  onMigrate: () => void;
  approving: boolean;
}
const MigrationTab: React.FC<MigrationTabProps> = ({
  tokenType,
  v1Balance,
  v2Balance,
  migrationContract,
  migrationAmount,
  setMigrationAmount,
  onApprove,
  onMigrate,
  approving
}) => {
  const { getTokenAllowance } = useWeb3();
  const { contracts } = useContractData();
  const [isApproved, setIsApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  
  const {
    userStats,
    globalStats,
    loading
  } = migrationContract;

  // Check approval status whenever amount or contracts change
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!migrationAmount || parseFloat(migrationAmount) <= 0) {
        setIsApproved(false);
        return;
      }

      const v1Contract = tokenType === 'CIFI' ? contracts.cifiV1 : contracts.refiV1;
      const migrationContract = tokenType === 'CIFI' ? contracts.cifiMigration : contracts.refiMigration;
      
      if (!v1Contract || !migrationContract) return;

      setCheckingApproval(true);
      try {
        const allowance = await getTokenAllowance(v1Contract.address, migrationContract.address);
        const hasApproval = parseFloat(allowance) >= parseFloat(migrationAmount);
        setIsApproved(hasApproval);
      } catch (error) {
        console.error('Error checking approval:', error);
        setIsApproved(false);
      } finally {
        setCheckingApproval(false);
      }
    };

    checkApprovalStatus();
  }, [migrationAmount, contracts, tokenType, getTokenAllowance]);

  // Enhanced approve handler that refreshes approval status
  const handleApproveWithRefresh = async () => {
    await onApprove();
    
    // Refresh approval status after a short delay
    setTimeout(() => {
      const checkApprovalStatus = async () => {
        const v1Contract = tokenType === 'CIFI' ? contracts.cifiV1 : contracts.refiV1;
        const migrationContract = tokenType === 'CIFI' ? contracts.cifiMigration : contracts.refiMigration;
        
        if (!v1Contract || !migrationContract || !migrationAmount) return;

        try {
          const allowance = await getTokenAllowance(v1Contract.address, migrationContract.address);
          const hasApproval = parseFloat(allowance) >= parseFloat(migrationAmount);
          setIsApproved(hasApproval);
        } catch (error) {
          console.error('Error checking approval after approve:', error);
        }
      };
      checkApprovalStatus();
    }, 2000);
  };
  return <div className="space-y-4">
      {/* Token Balances */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{tokenType} v1 Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{parseFloat(v1Balance).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Available for migration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{tokenType} v2 Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{parseFloat(v2Balance).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">New token balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Stats */}
      {userStats && globalStats && <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Migration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold">{parseFloat(userStats.totalMigrated).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Your Total Migrated</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{parseFloat(globalStats.remainingCapacity).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Global Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Migration Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Migrate {tokenType} Tokens</CardTitle>
              <CardDescription className="text-xs">
                Migrate your v1 tokens to v2 tokens (1:1 ratio)
              </CardDescription>
            </div>
            {parseFloat(migrationAmount) > 0 && <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <Clock className="h-3 w-3" />
                <span>{migrationAmount} → {migrationAmount}</span>
              </div>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">Migration Amount</Label>
            <Input id="amount" type="number" placeholder="Enter amount to migrate" value={migrationAmount} onChange={e => setMigrationAmount(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleApproveWithRefresh} 
              disabled={!migrationAmount || parseFloat(migrationAmount) <= 0 || approving || checkingApproval} 
              variant={isApproved ? "secondary" : "default"}
              size="sm"
            >
              {approving ? 'Approving...' : 
               checkingApproval ? 'Checking...' :
               isApproved ? '✓ Approved' : '1. Approve'}
            </Button>
            <Button 
              onClick={onMigrate} 
              disabled={!migrationAmount || parseFloat(migrationAmount) <= 0 || loading || !isApproved} 
              variant={isApproved ? "default" : "outline"}
              size="sm"
            >
              {loading ? 'Migrating...' : '2. Migrate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};