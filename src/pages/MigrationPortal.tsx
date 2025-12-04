import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useMigrationContract } from '@/hooks/useMigrationContract';
import { useContractData } from '@/hooks/useContractData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Wallet, ArrowRightLeft, Clock, Shield, ExternalLink, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedWalletSelectionModal } from '@/components/wallet/EnhancedWalletSelectionModal';
import { WalletType } from '@/types/wallet';


const MigrationPortal = () => {
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    connectWallet,
    disconnectWallet,
    switchToXDCNetwork,
    getTokenBalance,
    getTokenAllowance,
    approveToken,
    connecting
  } = useWeb3();

  const { contracts, loading: contractsLoading, error: contractsError } = useContractData();

  const [balances, setBalances] = useState({
    cifiV2: '0',
  });

  const [migrationAmount, setMigrationAmount] = useState('');
  const [approving, setApproving] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const cifiMigration = useMigrationContract(contracts.cifiMigration?.address || '');

  const handleWalletSelect = async (walletType: WalletType) => {
    setWalletModalOpen(false);
    await connectWallet(walletType);
  };

  // CIFI V2 token address - must match exactly
  const CIFI_V2_ADDRESS = '0x1932192f2D3145083a37ebBf1065f457621F0647';

  // Fetch token balances - only for CIFI V2
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !contracts.cifiV2 || contractsLoading) return;

      // Validate that the contract address matches CIFI V2
      if (contracts.cifiV2.address.toLowerCase() !== CIFI_V2_ADDRESS.toLowerCase()) {
        console.error('❌ Invalid CIFI V2 address. Expected:', CIFI_V2_ADDRESS, 'Got:', contracts.cifiV2.address);
        return;
      }

      try {
        const cifiV2Balance = await getTokenBalance(contracts.cifiV2.address);

        setBalances({
          cifiV2: cifiV2Balance,
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
  }, [isConnected, contracts, account, getTokenBalance, contractsLoading]);

  const handleApprove = async () => {
    if (!migrationAmount || !isConnected) return;

    if (!contracts.cifiV2 || !contracts.cifiMigration) return;

    // Validate CIFI V2 address before approval
    if (contracts.cifiV2.address.toLowerCase() !== CIFI_V2_ADDRESS.toLowerCase()) {
      console.error('❌ Invalid CIFI V2 address. Cannot approve migration.');
      return;
    }

    setApproving(true);
    try {
      await approveToken(contracts.cifiV2.address, contracts.cifiMigration.address, migrationAmount);
    } finally {
      setApproving(false);
    }
  };

  const handleMigrate = async () => {
    if (!migrationAmount || !cifiMigration) return;

    // Validate CIFI V2 address before migration
    if (!contracts.cifiV2 || contracts.cifiV2.address.toLowerCase() !== CIFI_V2_ADDRESS.toLowerCase()) {
      console.error('❌ Invalid CIFI V2 address. Cannot migrate.');
      return;
    }

    try {
      await cifiMigration.migrate(migrationAmount);
      setMigrationAmount('');
      
      // Refresh balances after migration
      setTimeout(() => {
        const fetchBalances = async () => {
          if (!contracts.cifiV2) return;
          const cifiV2Balance = await getTokenBalance(contracts.cifiV2.address);
          setBalances({
            cifiV2: cifiV2Balance,
          });
        };
        fetchBalances();
      }, 3000);
    } catch (error) {
      console.error('Migration error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access the Migration Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setWalletModalOpen(true)} 
              disabled={connecting}
              className="w-full"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            
            <EnhancedWalletSelectionModal
              open={walletModalOpen}
              onOpenChange={setWalletModalOpen}
              onWalletSelect={handleWalletSelect}
              connecting={connecting}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Always render wallet modal for connection
  const walletModal = (
    <EnhancedWalletSelectionModal
      open={walletModalOpen}
      onOpenChange={setWalletModalOpen}
      onWalletSelect={handleWalletSelect}
      connecting={connecting}
    />
  );

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Wrong Network</CardTitle>
            <CardDescription>
              Please switch to XDC Network to use the Migration Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={switchToXDCNetwork} className="w-full">
              Switch to XDC Network
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if contract address doesn't match CIFI V2
  if (contracts.cifiV2 && contracts.cifiV2.address.toLowerCase() !== CIFI_V2_ADDRESS.toLowerCase()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Invalid Token Address</CardTitle>
            <CardDescription>
              This migration portal only supports CIFI V2 tokens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Required CIFI V2 Address:</strong>
                <br />
                <code className="font-mono text-xs break-all">0x1932192f2D3145083a37ebBf1065f457621F0647</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Connect Wallet Button */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">CIFI V2 to EPS Migration</h1>
            <p className="text-muted-foreground mb-4">
              Deposit CIFI V2 tokens on XDC Network and receive EPS tokens on BASE Network (1:1 ratio)
            </p>
            
            {/* Disclaimer */}
            <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <strong className="text-yellow-700 dark:text-yellow-400">Important:</strong> This migration portal is <strong>only for users who hold CIFI V2 tokens</strong>.
                <br />
                <span className="text-sm mt-1 block">
                  CIFI V2 Token Address: <code className="font-mono bg-background px-2 py-1 rounded text-xs break-all">0x1932192f2D3145083a37ebBf1065f457621F0647</code>
                </span>
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Connect/Disconnect Wallet Button */}
          {!isConnected ? (
            <Button 
              onClick={() => setWalletModalOpen(true)} 
              disabled={connecting}
              size="lg"
              className="shrink-0"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <Button 
              onClick={disconnectWallet}
              variant="outline"
              size="lg"
              className="shrink-0"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>

        {/* Wallet Status */}
        {isConnected && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connected Address</p>
                  <p className="font-mono font-medium">
                    {account?.substring(0, 6)}...{account?.substring(38)}
                  </p>
                </div>
                <Badge variant="default">XDC Network</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show connect prompt if not connected */}
        {!isConnected && (
          <Card className="mb-6 border-primary/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Wallet className="mx-auto h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet to Continue</h3>
                <p className="text-muted-foreground mb-4">
                  Please connect your wallet to access the migration portal
                </p>
                <Button 
                  onClick={() => setWalletModalOpen(true)} 
                  disabled={connecting}
                  size="lg"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Migration Interface */}
        {isConnected && (
          <MigrationTab
            tokenType="CIFI V2"
            v2Balance={balances.cifiV2}
            migrationContract={cifiMigration}
            migrationAmount={migrationAmount}
            setMigrationAmount={setMigrationAmount}
            onApprove={handleApprove}
            onMigrate={handleMigrate}
            approving={approving}
          />
        )}
      </div>
      {walletModal}
    </div>
  );
};

interface MigrationTabProps {
  tokenType: string;
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
  v2Balance,
  migrationContract,
  migrationAmount,
  setMigrationAmount,
  onApprove,
  onMigrate,
  approving,
}) => {
  const { userStats, globalStats, loading } = migrationContract;

  return (
    <div className="space-y-6">
      {/* Cross-Chain Migration Info */}
      <Alert>
        <ExternalLink className="h-4 w-4" />
        <AlertDescription>
          <strong>Cross-Chain Migration:</strong> Your CIFI V2 tokens will be locked on XDC Network. 
          EPS tokens will be sent to the same wallet address on BASE Network (1:1 ratio).
        </AlertDescription>
      </Alert>

      {/* Token Balances */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CIFI V2 Balance (XDC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{parseFloat(v2Balance).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Available for migration</p>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Token: 0x1932...F0647
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">EPS Tokens (BASE)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{parseFloat(migrationAmount || '0').toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Will be sent to your wallet on BASE</p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Stats */}
      {userStats && globalStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Migration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{parseFloat(userStats.totalMigrated).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Your Total Migrated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{parseFloat(globalStats.remainingCapacity).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Global Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Migrate {tokenType} Tokens</CardTitle>
            <CardDescription>
              Lock CIFI V2 tokens on XDC Network to receive EPS tokens on BASE Network (1:1 ratio)
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Migration Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to migrate"
              value={migrationAmount}
              onChange={(e) => setMigrationAmount(e.target.value)}
            />
          </div>

          {parseFloat(migrationAmount) > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                You will lock {migrationAmount} CIFI V2 tokens on XDC Network and receive {migrationAmount} EPS tokens on BASE Network.
                EPS tokens will be sent to the same wallet address on BASE.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={onApprove}
              disabled={!migrationAmount || parseFloat(migrationAmount) <= 0 || approving}
              variant="outline"
            >
              {approving ? 'Approving...' : '1. Approve'}
            </Button>
            <Button
              onClick={onMigrate}
              disabled={!migrationAmount || parseFloat(migrationAmount) <= 0 || loading}
            >
              {loading ? 'Migrating...' : '2. Migrate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationPortal;