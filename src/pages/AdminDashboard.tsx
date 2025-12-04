import { NetworkManagement } from "@/components/admin/NetworkManagement";
import { ContractManagement } from "@/components/admin/ContractManagement";
import { CrossChainMigrationManagement } from "@/components/admin/CrossChainMigrationManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, FileCode, Shield, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { db, COLLECTIONS } from "@/integrations/db";

interface Web3Network {
  id: string;
  name: string;
  chain_id: number;
  rpc_url: string;
  explorer_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface SmartContract {
  id: string;
  name: string;
  address: string;
  network_id: string;
  is_active: boolean;
  created_at: string;
  web3_networks: {
    name: string;
  };
}

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [networks, setNetworks] = useState<Web3Network[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [networksResponse, contractsResponse] = await Promise.allSettled([
        db.from(COLLECTIONS.WEB3_NETWORKS).select('*').order('created_at', 'desc').execute(),
        db.from(COLLECTIONS.SMART_CONTRACTS).select('*').order('created_at', 'desc').execute()
      ]);

      // Handle networks
      if (networksResponse.status === 'fulfilled' && networksResponse.value.data) {
        setNetworks(networksResponse.value.data as any);
      } else if (networksResponse.status === 'rejected') {
        console.warn('web3_networks collection not found (optional)');
      }

      // Handle contracts
      if (contractsResponse.status === 'fulfilled' && contractsResponse.value.data) {
        const contractsWithNetworks = contractsResponse.value.data.map((contract: any) => {
          const network = networksResponse.status === 'fulfilled' && networksResponse.value.data
            ? networksResponse.value.data.find((n: any) => n.$id === contract.network_id)
            : null;
          return {
            ...contract,
            id: contract.$id,
            web3_networks: network ? { name: network.name } : null
          };
        });
        setContracts(contractsWithNetworks as any);
      } else if (contractsResponse.status === 'rejected') {
        console.warn('smart_contracts collection not found (optional)');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      title: "Active Networks",
      value: networks.filter(n => n.is_active).length,
      total: networks.length,
      icon: Network,
      color: "text-blue-500"
    },
    {
      title: "Smart Contracts",
      value: contracts.filter(c => c.is_active).length,
      total: contracts.length,
      icon: FileCode,
      color: "text-green-500"
    },
    {
      title: "Your Role",
      value: userRole || "user",
      icon: Shield,
      color: "text-purple-500"
    },
    {
      title: "System Status",
      value: "Active",
      icon: Activity,
      color: "text-emerald-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className={`flex-1 ${isMobile ? 'p-4' : 'p-8'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className={`font-bold text-foreground mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Migration Admin Dashboard
              </h1>
              <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Manage networks, contracts, and cross-chain token distributions
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                          {typeof stat.value === 'number' && stat.total ? 
                            `${stat.value}/${stat.total}` : 
                            stat.value
                          }
                        </p>
                      </div>
                      <div className={`rounded-lg bg-primary/10 flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}>
                        <stat.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Migration Management Tabs */}
            <Tabs defaultValue="networks" className="space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="networks">Networks</TabsTrigger>
                <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
                <TabsTrigger value="cross-chain">Cross-Chain</TabsTrigger>
              </TabsList>
                      
              <TabsContent value="networks">
                <NetworkManagement />
              </TabsContent>
              
              <TabsContent value="contracts">
                <ContractManagement />
              </TabsContent>

              <TabsContent value="cross-chain">
                <CrossChainMigrationManagement />
              </TabsContent>
            </Tabs>
          </div>
        </main>
    </div>
  );
};

export default AdminDashboard;