import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '@/contexts/Web3Context';

const V2_CONTRACTS = {
  CIFI: '0x1932192f2D3145083a37ebBf1065f457621F0647',
  REFI: '0x2D010d707da973E194e41D7eA52617f8F969BD23'
};

export const useTokenBalances = () => {
  const { getTokenBalance, account, isConnected, isCorrectNetwork } = useWeb3();

  return useQuery({
    queryKey: ['token-balances', account],
    queryFn: async () => {
      if (!isConnected || !isCorrectNetwork) {
        return { cifi: '0', refi: '0' };
      }

      const [cifiBalance, refiBalance] = await Promise.all([
        getTokenBalance(V2_CONTRACTS.CIFI),
        getTokenBalance(V2_CONTRACTS.REFI)
      ]);

      return {
        cifi: cifiBalance,
        refi: refiBalance
      };
    },
    enabled: isConnected && isCorrectNetwork && !!account,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
};