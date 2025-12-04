import { Sidebar } from "@/components/Sidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { PersonalizedHeader } from "@/components/dashboard/PersonalizedHeader";
import { TokenBalanceCard } from "@/components/dashboard/TokenBalanceCard";
import { WalletStatusCard } from "@/components/dashboard/WalletStatusCard";
import { MigrationSummaryCard } from "@/components/dashboard/MigrationSummaryCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useIsMobile } from "@/hooks/use-mobile";
import { Coins } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const { data: tokenBalances, isLoading: balancesLoading } = useTokenBalances();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <div className={`flex flex-col min-h-screen ${!isMobile ? 'ml-64' : ''}`}>
        <TopNavigation onMenuToggle={toggleSidebar} />
        
        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-8'}`}>
          <div className="max-w-7xl mx-auto">
            <PersonalizedHeader />

            {/* Token Balances Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <TokenBalanceCard
                tokenSymbol="CIFI"
                balance={tokenBalances?.cifi || '0'}
                loading={balancesLoading}
                icon={<Coins className="h-4 w-4 text-primary" />}
              />
              <TokenBalanceCard
                tokenSymbol="REFI"
                balance={tokenBalances?.refi || '0'}
                loading={balancesLoading}
                icon={<Coins className="h-4 w-4 text-primary" />}
              />
            </div>

            {/* Status and Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              <WalletStatusCard />
              <MigrationSummaryCard />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;