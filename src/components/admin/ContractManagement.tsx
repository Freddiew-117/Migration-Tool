import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit2, Trash2, Code, Play, CheckCircle, XCircle } from 'lucide-react';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SmartContract {
  id: string;
  name: string;
  address: string;
  network_id: string;
  abi: any;
  is_active: boolean;
  created_at: string;
  web3_networks?: {
    name: string;
    chain_id: number;
  };
}

interface Web3Network {
  id: string;
  name: string;
  chain_id: number;
}

interface ContractFormData {
  name: string;
  address: string;
  networkId: string;
  abi: string;
  sourceCode: string;
  isActive: boolean;
}

export const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [networks, setNetworks] = useState<Web3Network[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<SmartContract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    address: '',
    networkId: '',
    abi: '',
    sourceCode: '',
    isActive: true
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Load contracts and networks
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load contracts
      const { data: contractsData, error: contractsError } = await db
        .from(COLLECTIONS.SMART_CONTRACTS)
        .select('*')
        .order('created_at', 'desc')
        .execute();

      if (contractsError) throw contractsError;

      // Load networks for dropdown
      const { data: networksData, error: networksError } = await db
        .from(COLLECTIONS.WEB3_NETWORKS)
        .select('$id, name, chain_id')
        .eq('is_active', true)
        .order('name', 'asc')
        .execute();

      if (networksError) throw networksError;

      // Map contracts with network info
      const networksMap = new Map((networksData || []).map((n: any) => [n.$id, n]));
      const contractsWithNetworks = (contractsData || []).map((c: any) => {
        const network = networksMap.get(c.network_id);
        return {
          ...c,
          id: c.$id || c.id,
          web3_networks: network ? { name: network.name, chain_id: network.chain_id } : null
        };
      });

      setContracts(contractsWithNetworks as any);
      setNetworks((networksData || []).map((n: any) => ({ ...n, id: n.$id || n.id })) as any);
    } catch (error: any) {
      toast({
        title: "Failed to Load Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validate contract address format
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Validate ABI JSON format
  const isValidABI = (abi: string): boolean => {
    if (!abi.trim()) return true; // Allow empty ABI
    
    try {
      const parsed = JSON.parse(abi);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  };

  // Save contract
  const saveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to manage contracts",
        variant: "destructive",
      });
      return;
    }

    // Validate address
    if (!isValidAddress(formData.address)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid contract address (0x...)",
        variant: "destructive",
      });
      return;
    }

    // Validate ABI
    if (!isValidABI(formData.abi)) {
      toast({
        title: "Invalid ABI",
        description: "Please enter a valid JSON ABI array",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const contractData = {
        name: formData.name,
        address: formData.address.toLowerCase(),
        network_id: formData.networkId,
        abi: formData.abi ? JSON.parse(formData.abi) : null,
        source_code: formData.sourceCode || null,
        is_active: formData.isActive,
        created_by: user.id
      };

      // Convert ABI to string if it's an object
      const contractDataToSave = {
        ...contractData,
        abi: typeof contractData.abi === 'string' ? contractData.abi : JSON.stringify(contractData.abi || null)
      };

      if (editingContract) {
        const { error } = await db.update(COLLECTIONS.SMART_CONTRACTS, editingContract.id, contractDataToSave);
        if (error) throw error;
      } else {
        const { error } = await db.insert(COLLECTIONS.SMART_CONTRACTS, contractDataToSave);
        if (error) throw error;
      }

      toast({
        title: editingContract ? "Contract Updated" : "Contract Added",
        description: `${formData.name} has been ${editingContract ? 'updated' : 'added'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadData();
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

  // Delete contract
  const deleteContract = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await db.remove(COLLECTIONS.SMART_CONTRACTS, id);

      if (error) throw error;

      toast({
        title: "Contract Deleted",
        description: `${name} has been deleted successfully`,
      });

      loadData();
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
      address: '',
      networkId: '',
      abi: '',
      sourceCode: '',
      isActive: true
    });
    setEditingContract(null);
  };

  // Open edit dialog
  const openEditDialog = (contract: SmartContract) => {
    setFormData({
      name: contract.name,
      address: contract.address,
      networkId: contract.network_id,
      abi: contract.abi ? JSON.stringify(contract.abi, null, 2) : '',
      sourceCode: (contract as any).source_code || '',
      isActive: contract.is_active
    });
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Contract Management</h2>
          <p className="text-muted-foreground">
            Manage smart contracts and their ABIs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContract ? 'Edit Contract' : 'Add New Contract'}
              </DialogTitle>
              <DialogDescription>
                {editingContract 
                  ? 'Update smart contract configuration'
                  : 'Configure a new smart contract'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={saveContract} className="space-y-4">
              <div>
                <Label htmlFor="name">Contract Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., USDC Token Contract"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Contract Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="networkId">Network</Label>
                <Select
                  value={formData.networkId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, networkId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        {network.name} (Chain ID: {network.chain_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="abi">Contract ABI (JSON)</Label>
                <Textarea
                  id="abi"
                  value={formData.abi}
                  onChange={(e) => setFormData(prev => ({ ...prev, abi: e.target.value }))}
                  placeholder="Paste the contract ABI JSON array here..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the ABI as a JSON array. Leave empty if not available.
                </p>
              </div>
              
              <div>
                <Label htmlFor="sourceCode">Source Code (Solidity)</Label>
                <Textarea
                  id="sourceCode"
                  value={formData.sourceCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceCode: e.target.value }))}
                  placeholder="Paste the Solidity source code here..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the Solidity source code. Leave empty if not available.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active Contract</Label>
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
                  {isLoading ? 'Saving...' : editingContract ? 'Update' : 'Add Contract'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Smart Contracts ({contracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No smart contracts configured yet.</p>
              <Button onClick={openAddDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add First Contract
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ABI</TableHead>
                  <TableHead>Source Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      {contract.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">
                        {formatAddress(contract.address)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{contract.web3_networks?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          Chain {contract.web3_networks?.chain_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contract.is_active ? "default" : "secondary"}>
                        {contract.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contract.abi ? "default" : "secondary"}>
                        {contract.abi ? "Available" : "Missing"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(contract as any).source_code ? "default" : "secondary"}>
                        {(contract as any).source_code ? "Available" : "Missing"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(contract)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteContract(contract.id, contract.name)}
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