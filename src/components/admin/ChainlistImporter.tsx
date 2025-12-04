import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download, Globe, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChainlistNetwork {
  chainId: number;
  name: string;
  chain: string;
  icon?: string;
  rpc: string[];
  faucets: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL?: string;
  shortName: string;
  networkId: number;
  slip44?: number;
  ens?: {
    registry: string;
  };
  explorers?: Array<{
    name: string;
    url: string;
    standard: string;
  }>;
  testnet?: boolean;
}

interface ChainlistImporterProps {
  onNetworkImported?: () => void;
}

export const ChainlistImporter: React.FC<ChainlistImporterProps> = ({ onNetworkImported }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [networks, setNetworks] = useState<ChainlistNetwork[]>([]);
  const [filteredNetworks, setFilteredNetworks] = useState<ChainlistNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<number | null>(null);
  const [testingRpc, setTestingRpc] = useState<number | null>(null);
  const [showTestnets, setShowTestnets] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch networks from chainlist.org
  const fetchNetworks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://chainid.network/chains.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chainlist data');
      }
      
      const data: ChainlistNetwork[] = await response.json();
      
      // Filter networks with valid RPC endpoints
      const validNetworks = data.filter(network => 
        network.rpc && 
        network.rpc.length > 0 && 
        network.rpc.some(rpc => rpc.startsWith('http'))
      );
      
      setNetworks(validNetworks);
      setFilteredNetworks(validNetworks);
      
      toast({
        title: "Networks Loaded",
        description: `Loaded ${validNetworks.length} networks from chainlist.org`,
      });
    } catch (error: any) {
      console.error('Error fetching networks:', error);
      toast({
        title: "Failed to Load Networks",
        description: error.message || "Could not fetch networks from chainlist.org",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter networks based on search term and testnet preference
  useEffect(() => {
    let filtered = networks;

    if (!showTestnets) {
      filtered = filtered.filter(network => !network.testnet);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(network =>
        network.name.toLowerCase().includes(term) ||
        network.chain.toLowerCase().includes(term) ||
        network.shortName.toLowerCase().includes(term) ||
        network.chainId.toString().includes(term)
      );
    }

    setFilteredNetworks(filtered);
  }, [networks, searchTerm, showTestnets]);

  // Test RPC connection
  const testRpcConnection = async (rpcUrls: string[], chainId: number) => {
    setTestingRpc(chainId);
    
    // Try each RPC URL until one works
    for (const rpcUrl of rpcUrls) {
      if (!rpcUrl.startsWith('http')) continue;
      
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        });

        const data = await response.json();
        
        if (data.result) {
          toast({
            title: "RPC Connection Successful",
            description: `${rpcUrl} - Latest block: ${parseInt(data.result, 16)}`,
          });
          setTestingRpc(null);
          return rpcUrl; // Return working RPC URL
        }
      } catch (error) {
        continue; // Try next RPC URL
      }
    }
    
    // If no RPC works
    toast({
      title: "RPC Connection Failed",
      description: "All RPC endpoints failed to respond",
      variant: "destructive",
    });
    setTestingRpc(null);
    return null;
  };

  // Import network to database
  const importNetwork = async (network: ChainlistNetwork) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to import networks",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(network.chainId);

    try {
      // Find working RPC URL
      const workingRpc = await testRpcConnection(
        network.rpc.filter(rpc => rpc.startsWith('http')), 
        network.chainId
      );
      
      if (!workingRpc) {
        setIsImporting(null);
        return;
      }

      // Check if network already exists
      const { data: existingNetwork } = await db
        .from(COLLECTIONS.WEB3_NETWORKS)
        .select('chain_id')
        .eq('chain_id', network.chainId)
        .single();

      if (existingNetwork) {
        toast({
          title: "Network Already Exists",
          description: `Chain ID ${network.chainId} is already configured`,
          variant: "destructive",
        });
        setIsImporting(null);
        return;
      }

      // Import network to database
      const networkData = {
        name: network.name,
        chain_id: network.chainId,
        rpc_url: workingRpc,
        explorer_url: network.explorers?.[0]?.url || null,
        is_active: true,
        created_by: user.id,
        chain_id_hex: `0x${network.chainId.toString(16)}`,
        native_currency_name: network.nativeCurrency.name,
        native_currency_symbol: network.nativeCurrency.symbol,
        native_currency_decimals: network.nativeCurrency.decimals,
        block_explorer_name: network.explorers?.[0]?.name || null,
        is_testnet: network.testnet || false,
        chainlist_id: network.chainId,
        icon_url: network.icon || null,
        rpc_urls: JSON.stringify(network.rpc.filter(rpc => rpc.startsWith('http'))),
        faucets: JSON.stringify(network.faucets || [])
      };

      const { error } = await db.insert(COLLECTIONS.WEB3_NETWORKS, networkData);

      if (error) throw error;

      toast({
        title: "Network Imported Successfully",
        description: `${network.name} has been added to your networks`,
      });

      if (onNetworkImported) {
        onNetworkImported();
      }

      // Notify Web3Context to refresh networks globally
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('networksUpdated'));
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import network",
        variant: "destructive",
      });
    } finally {
      setIsImporting(null);
    }
  };

  // Load networks when dialog opens
  useEffect(() => {
    if (isOpen && networks.length === 0) {
      fetchNetworks();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2">
          <Globe className="mr-2 h-4 w-4" />
          Import from Chainlist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Networks from Chainlist.org</DialogTitle>
          <DialogDescription>
            Search and import blockchain networks directly from chainlist.org. 
            All networks are automatically tested before import.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="search">Search Networks</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, chain ID, or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="testnets"
                checked={showTestnets}
                onChange={(e) => setShowTestnets(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="testnets" className="text-sm">
                Include Testnets
              </Label>
            </div>

            <Button 
              variant="outline" 
              onClick={fetchNetworks}
              disabled={isLoading}
              className="mt-6"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {/* Networks Table */}
          <div className="border rounded-lg max-h-96 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading networks...</span>
              </div>
            ) : filteredNetworks.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No networks match your search' : 'No networks available'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Chain ID</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>RPC Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNetworks.slice(0, 100).map((network) => (
                    <TableRow key={network.chainId}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {network.icon && (
                            <img 
                              src={network.icon} 
                              alt={network.name}
                              className="w-5 h-5 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{network.name}</div>
                            <div className="text-sm text-muted-foreground">{network.shortName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{network.chainId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{network.nativeCurrency.symbol}</div>
                          <div className="text-muted-foreground">{network.nativeCurrency.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={network.testnet ? "secondary" : "default"}>
                          {network.testnet ? "Testnet" : "Mainnet"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testRpcConnection(
                            network.rpc.filter(rpc => rpc.startsWith('http')), 
                            network.chainId
                          )}
                          disabled={testingRpc === network.chainId}
                        >
                          {testingRpc === network.chainId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => importNetwork(network)}
                          disabled={isImporting === network.chainId}
                        >
                          {isImporting === network.chainId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Import
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {filteredNetworks.length > 100 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing first 100 results. Use search to find specific networks.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};