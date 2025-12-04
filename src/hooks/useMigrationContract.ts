import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { parseUnits } from 'ethers';

const MIGRATION_CONTRACT_ABI = [
  "function migrate(uint256 amount)",
  "function canMigrate(address user, uint256 amount) view returns (bool)",
  "function getUserStats(address user) view returns (uint256 total, uint256 dailyMigrated, uint256 remainingDaily, bool isWhitelisted)",
  "function getGlobalStats() view returns (uint256 migrated, uint256 remaining, uint256 v2Balance, uint256 v1Balance)",
  "function getUserRemainingDailyCapacity(address user) view returns (uint256)",
  "function getRemainingGlobalCapacity() view returns (uint256)",
  "function totalMigrated() view returns (uint256)",
  "function migrationEnabled() view returns (bool)"
];

interface UserStats {
  totalMigrated: string;
  dailyMigrated: string;
  remainingDaily: string;
  isWhitelisted: boolean;
}

interface GlobalStats {
  totalMigrated: string;
  remainingCapacity: string;
  v2Balance: string;
  v1Balance: string;
}

export const useMigrationContract = (contractAddress: string) => {
  const { provider, account, executeTransaction } = useWeb3();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserStats = async () => {
    if (!provider || !account || !contractAddress) return;
    
    try {
      const contract = new (await import('ethers')).Contract(contractAddress, MIGRATION_CONTRACT_ABI, provider);
      const stats = await contract.getUserStats(account);
      
      setUserStats({
        totalMigrated: (await import('ethers')).formatUnits(stats[0], 18),
        dailyMigrated: (await import('ethers')).formatUnits(stats[1], 18),
        remainingDaily: (await import('ethers')).formatUnits(stats[2], 18),
        isWhitelisted: stats[3],
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchGlobalStats = async () => {
    if (!provider || !contractAddress) return;
    
    try {
      const contract = new (await import('ethers')).Contract(contractAddress, MIGRATION_CONTRACT_ABI, provider);
      const stats = await contract.getGlobalStats();
      
      setGlobalStats({
        totalMigrated: (await import('ethers')).formatUnits(stats[0], 18),
        remainingCapacity: (await import('ethers')).formatUnits(stats[1], 18),
        v2Balance: (await import('ethers')).formatUnits(stats[2], 18),
        v1Balance: (await import('ethers')).formatUnits(stats[3], 18),
      });
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };

  const canMigrate = async (amount: string): Promise<boolean> => {
    if (!provider || !account || !contractAddress) return false;
    
    try {
      const contract = new (await import('ethers')).Contract(contractAddress, MIGRATION_CONTRACT_ABI, provider);
      return await contract.canMigrate(account, parseUnits(amount, 18));
    } catch (error) {
      console.error('Error checking if can migrate:', error);
      return false;
    }
  };

  const migrate = async (amount: string) => {
    if (!contractAddress) throw new Error('Contract address not provided');
    
    setLoading(true);
    try {
      await executeTransaction(
        contractAddress,
        MIGRATION_CONTRACT_ABI,
        'migrate',
        [parseUnits(amount, 18)]
      );
      
      // Refresh stats after successful migration
      await Promise.all([fetchUserStats(), fetchGlobalStats()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provider && account && contractAddress) {
      fetchUserStats();
      fetchGlobalStats();
    }
  }, [provider, account, contractAddress]);

  return {
    userStats,
    globalStats,
    loading,
    canMigrate,
    migrate,
    refetchStats: () => Promise.all([fetchUserStats(), fetchGlobalStats()]),
  };
};