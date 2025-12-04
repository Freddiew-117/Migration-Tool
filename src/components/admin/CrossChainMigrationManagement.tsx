import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';

interface MigrationEvent {
  id: string;
  wallet_address: string;
  token_type: string;
  amount: string;
  transaction_hash: string | null;
  status: string;
  created_at: string;
  base_distribution_status: string | null;
  base_distribution_tx_hash: string | null;
  base_distribution_sent_at: string | null;
  base_v2_token_address: string | null;
}

const BASE_NETWORK = {
  chainId: 8453,
  chainName: 'Base',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org/'],
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

export const CrossChainMigrationManagement: React.FC = () => {
  const [migrations, setMigrations] = useState<MigrationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [baseProvider, setBaseProvider] = useState<BrowserProvider | null>(null);
  const [baseAccount, setBaseAccount] = useState<string | null>(null);
  const [baseChainId, setBaseChainId] = useState<number | null>(null);
  const [epsTokenAddress, setEpsTokenAddress] = useState('');
  const { toast } = useToast();

  const isConnectedToBase = baseAccount && baseChainId === BASE_NETWORK.chainId;
  // Only show migrations that haven't received tokens yet (null, 'pending', or 'failed')
  const pendingMigrations = migrations.filter(m => 
    !m.base_distribution_status || 
    m.base_distribution_status === 'pending' || 
    m.base_distribution_status === 'failed'
  );
  const sentMigrations = migrations.filter(m => m.base_distribution_status === 'sent');

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from(COLLECTIONS.MIGRATION_EVENTS)
        .select('*')
        .eq('status', 'confirmed')
        .order('created_at', 'desc')
        .limit(1000)
        .execute();

      if (error) throw error;
      setMigrations(data || []);
    } catch (error: any) {
      console.error('Error fetching migrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch migration events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectBaseWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      setBaseProvider(provider);
      setBaseAccount(accounts[0]);
      setBaseChainId(Number(network.chainId));

      // Check if on Base network
      if (Number(network.chainId) !== BASE_NETWORK.chainId) {
        await switchToBaseNetwork();
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to Base: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const switchToBaseNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_NETWORK.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Network doesn't exist, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_NETWORK.chainId.toString(16)}`,
            chainName: BASE_NETWORK.chainName,
            nativeCurrency: BASE_NETWORK.nativeCurrency,
            rpcUrls: BASE_NETWORK.rpcUrls,
            blockExplorerUrls: BASE_NETWORK.blockExplorerUrls,
          }],
        });
      } else {
        throw switchError;
      }
    }
  };

  const sendTokensToAddress = async (tokenAddress: string, toAddress: string, amount: string) => {
    if (!baseProvider || !baseAccount) throw new Error('Wallet not connected');

    const signer = await baseProvider.getSigner();
    const contract = new Contract(tokenAddress, ERC20_ABI, signer);
    
    // Get token decimals
    const decimals = await contract.decimals();
    const amountInWei = parseUnits(amount, decimals);
    
    // Send transaction
    const tx = await contract.transfer(toAddress, amountInWei);
    return tx;
  };

  const sendAllPending = async () => {
    if (!isConnectedToBase || !baseProvider) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to Base network first",
        variant: "destructive",
      });
      return;
    }

    if (!epsTokenAddress) {
      toast({
        title: "Token Address Required",
        description: "Please enter EPS token address on BASE Network",
        variant: "destructive",
      });
      return;
    }

    // Confirm before sending
    const confirmed = window.confirm(
      `Send EPS tokens to ${pendingMigrations.length} wallet(s) that haven't received them yet?\n\n` +
      `This will mark them as "sent" in the database to prevent double-paying.`
    );

    if (!confirmed) return;

    setSending(true);
    const failed: string[] = [];
    const succeeded: string[] = [];

    try {
      for (const migration of pendingMigrations) {
        try {
          // Double-check: Skip if already sent (safety check)
          if (migration.base_distribution_status === 'sent') {
            console.log(`Skipping ${migration.wallet_address} - already sent`);
            continue;
          }

          // All migrations are CIFI -> EPS, so use EPS token address
          const tokenAddress = epsTokenAddress;

          if (!tokenAddress) {
            failed.push(migration.id);
            continue;
          }

          // Send tokens
          const tx = await sendTokensToAddress(
            tokenAddress,
            migration.wallet_address,
            migration.amount
          );

          // Wait for confirmation
          const receipt = await tx.wait();

          // Update database IMMEDIATELY to prevent double-paying
          await db.update(
            COLLECTIONS.MIGRATION_EVENTS,
            migration.id,
            {
              base_distribution_status: 'sent',
              base_distribution_tx_hash: receipt.hash,
              base_distribution_sent_at: new Date().toISOString(),
              base_v2_token_address: tokenAddress,
            }
          );

          succeeded.push(migration.id);

          toast({
            title: "Tokens Sent",
            description: `Sent ${migration.amount} EPS to ${migration.wallet_address.substring(0, 6)}...${migration.wallet_address.substring(38)}`,
          });

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.error(`Error sending to ${migration.wallet_address}:`, error);
          
          // Mark as failed in database
          await db.update(
            COLLECTIONS.MIGRATION_EVENTS,
            migration.id,
            {
              base_distribution_status: 'failed',
            }
          );

          failed.push(migration.id);
        }
      }

      // Refresh list
      await fetchMigrations();

      toast({
        title: "Batch Complete",
        description: `Sent ${succeeded.length} successfully, ${failed.length} failed`,
        variant: failed.length > 0 ? "destructive" : "default",
      });
    } catch (error: any) {
      console.error('Error in batch send:', error);
      toast({
        title: "Batch Send Failed",
        description: error.message || "Failed to send tokens",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (migration: MigrationEvent) => {
    const status = migration.base_distribution_status || 'pending';
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cross-Chain Migration Management</CardTitle>
          <CardDescription>
            Manage V2 token distributions on Base network for XDC migrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Connection */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5" />
              <div>
                <p className="font-medium">Base Network Wallet</p>
                <p className="text-sm text-muted-foreground">
                  {isConnectedToBase 
                    ? `Connected: ${baseAccount?.substring(0, 6)}...${baseAccount?.substring(38)}`
                    : 'Not connected'
                  }
                </p>
              </div>
            </div>
            {!isConnectedToBase ? (
              <Button onClick={connectBaseWallet}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <Badge variant="default">Connected to Base</Badge>
            )}
          </div>

          {/* EPS Token Address */}
          <div className="space-y-2">
            <Label htmlFor="eps-address">EPS Token Address (Base Network)</Label>
            <Input
              id="eps-address"
              placeholder="0x..."
              value={epsTokenAddress}
              onChange={(e) => setEpsTokenAddress(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter the EPS token contract address on BASE Network
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Migrations</p>
                <p className="text-2xl font-bold">{migrations.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingMigrations.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-green-600">
                  {migrations.filter(m => m.base_distribution_status === 'sent').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Send All Button */}
          {pendingMigrations.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {pendingMigrations.length} wallet{pendingMigrations.length !== 1 ? 's' : ''} ready to receive EPS tokens
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      These wallets have migrated CIFI tokens but haven't received EPS tokens yet. 
                      Sending will mark them as "sent" in the database to prevent double-paying.
                    </p>
                  </div>
                  <Button 
                    onClick={sendAllPending} 
                    disabled={sending || !isConnectedToBase || !epsTokenAddress}
                    className="ml-4"
                    size="lg"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send EPS Tokens to All
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info: Already Sent */}
          {pendingMigrations.length === 0 && sentMigrations.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All {sentMigrations.length} migration{sentMigrations.length !== 1 ? 's' : ''} have received EPS tokens. 
                No pending distributions.
              </AlertDescription>
            </Alert>
          )}

          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={fetchMigrations} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Events</CardTitle>
          <CardDescription>
            All confirmed migrations from XDC network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading migrations...</p>
            </div>
          ) : migrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No migrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>XDC TX</TableHead>
                    <TableHead>Base Status</TableHead>
                    <TableHead>Base TX</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migrations.map((migration) => (
                    <TableRow key={migration.id}>
                      <TableCell className="font-mono text-sm">
                        {migration.wallet_address.substring(0, 6)}...{migration.wallet_address.substring(38)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">EPS</Badge>
                      </TableCell>
                      <TableCell>{parseFloat(migration.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        {migration.transaction_hash ? (
                          <a
                            href={`https://explorer.xinfin.network/tx/${migration.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(migration)}</TableCell>
                      <TableCell>
                        {migration.base_distribution_tx_hash ? (
                          <a
                            href={`https://basescan.org/tx/${migration.base_distribution_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(migration.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

