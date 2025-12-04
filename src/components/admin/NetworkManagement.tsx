import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Plus, Edit2, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ChainlistImporter } from './ChainlistImporter';

interface Web3Network {
  id: string;
  name: string;
  chain_id: number;
  rpc_url: string;
  explorer_url?: string;
  is_active: boolean;
  created_at: string;
}

interface NetworkFormData {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  isActive: boolean;
}

export const NetworkManagement: React.FC = () => {
  const [networks, setNetworks] = useState<Web3Network[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Web3Network | null>(null);
  const [testingNetwork, setTestingNetwork] = useState<string | null>(null);
  const [formData, setFormData] = useState<NetworkFormData>({
    name: '',
    chainId: '',
    rpcUrl: '',
    explorerUrl: '',
    isActive: true
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Load networks
  const loadNetworks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await db
        .from(COLLECTIONS.WEB3_NETWORKS)
        .select('*')
        .order('created_at', 'desc')
        .execute();

      if (error) throw error;
      setNetworks((data || []).map((n: any) => ({ ...n, id: n.$id || n.id })));
    } catch (error: any) {
      toast({
        title: "Failed to Load Networks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test RPC connection
  const testRpcConnection = async (rpcUrl: string, networkId?: string) => {
    if (networkId) setTestingNetwork(networkId);
    
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
          description: `Latest block: ${parseInt(data.result, 16)}`,
        });
        return true;
      } else {
        throw new Error('Invalid RPC response');
      }
    } catch (error: any) {
      toast({
        title: "RPC Connection Failed",
        description: error.message || "Failed to connect to RPC endpoint",
        variant: "destructive",
      });
      return false;
    } finally {
      if (networkId) setTestingNetwork(null);
    }
  };

  // Save network
  const saveNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to manage networks",
        variant: "destructive",
      });
      return;
    }

    // Test RPC connection first
    const isRpcValid = await testRpcConnection(formData.rpcUrl);
    if (!isRpcValid) return;

    try {
      setIsLoading(true);

      const networkData = {
        name: formData.name,
        chain_id: parseInt(formData.chainId),
        rpc_url: formData.rpcUrl,
        explorer_url: formData.explorerUrl || null,
        is_active: formData.isActive,
        created_by: user.id
      };

      if (editingNetwork) {
        const { error } = await db.update(COLLECTIONS.WEB3_NETWORKS, editingNetwork.id, networkData);
        if (error) throw error;
      } else {
        const { error } = await db.insert(COLLECTIONS.WEB3_NETWORKS, networkData);
        if (error) throw error;
      }

      toast({
        title: editingNetwork ? "Network Updated" : "Network Added",
        description: `${formData.name} has been ${editingNetwork ? 'updated' : 'added'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadNetworks();
      
      // Notify Web3Context to refresh networks
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
        // Trigger a custom event that the Web3Context can listen to
        window.dispatchEvent(new CustomEvent('networksUpdated'));
      }
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete network
  const deleteNetwork = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await db.remove(COLLECTIONS.WEB3_NETWORKS, id);

      if (error) throw error;

      toast({
        title: "Network Deleted",
        description: `${name} has been deleted successfully`,
      });

      loadNetworks();
      
      // Notify Web3Context to refresh networks
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
        window.dispatchEvent(new CustomEvent('networksUpdated'));
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      chainId: '',
      rpcUrl: '',
      explorerUrl: '',
      isActive: true
    });
    setEditingNetwork(null);
  };

  // Open edit dialog
  const openEditDialog = (network: Web3Network) => {
    setFormData({
      name: network.name,
      chainId: network.chain_id.toString(),
      rpcUrl: network.rpc_url,
      explorerUrl: network.explorer_url || '',
      isActive: network.is_active
    });
    setEditingNetwork(network);
    setIsDialogOpen(true);
  };

  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadNetworks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Network Management</h2>
          <p className="text-muted-foreground">
            Manage Web3 networks and RPC endpoints
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ChainlistImporter onNetworkImported={loadNetworks} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Network
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingNetwork ? 'Edit Network' : 'Add New Network'}
              </DialogTitle>
              <DialogDescription>
                {editingNetwork 
                  ? 'Update network configuration'
                  : 'Configure a new Web3 network'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={saveNetwork} className="space-y-4">
              <div>
                <Label htmlFor="name">Network Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ethereum Mainnet"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="chainId">Chain ID</Label>
                <Input
                  id="chainId"
                  type="number"
                  value={formData.chainId}
                  onChange={(e) => setFormData(prev => ({ ...prev, chainId: e.target.value }))}
                  placeholder="e.g., 1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="rpcUrl">RPC URL</Label>
                <Input
                  id="rpcUrl"
                  value={formData.rpcUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, rpcUrl: e.target.value }))}
                  placeholder="https://mainnet.infura.io/v3/..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="explorerUrl">Explorer URL (Optional)</Label>
                <Input
                  id="explorerUrl"
                  value={formData.explorerUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, explorerUrl: e.target.value }))}
                  placeholder="https://explorer.xdc.org"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active Network</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingNetwork ? 'Update' : 'Add Network'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Networks ({networks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : networks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No networks configured yet.</p>
              <Button onClick={openAddDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add First Network
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Chain ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RPC Health</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networks.map((network) => (
                  <TableRow key={network.id}>
                    <TableCell className="font-medium">
                      {network.name}
                    </TableCell>
                    <TableCell>{network.chain_id}</TableCell>
                    <TableCell>
                      <Badge variant={network.is_active ? "default" : "secondary"}>
                        {network.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testRpcConnection(network.rpc_url, network.id)}
                        disabled={testingNetwork === network.id}
                      >
                        {testingNetwork === network.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(network)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNetwork(network.id, network.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};