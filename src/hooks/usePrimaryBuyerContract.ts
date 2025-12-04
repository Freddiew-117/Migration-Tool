import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

// Placeholder contract addresses - replace with actual deployed contract addresses
const PRIMARY_BUYER_CONTRACTS = {
  CIFI: '0x0000000000000000000000000000000000000000', // Replace with actual Primary Buyer contract for CIFI
  REFI: '0x0000000000000000000000000000000000000000', // Replace with actual Primary Buyer contract for REFI
};

// Placeholder ABI - replace with actual Primary Buyer contract ABI
const PRIMARY_BUYER_ABI = [
  "function sellTokens(uint256 tokenAmount) returns (uint256)",
  "function getUSDCPrice() view returns (uint256)",
  "function usdcAvailable() view returns (uint256)"
];

export const usePrimaryBuyerContract = () => {
  const { executeTransaction, approveToken, isConnected, isCorrectNetwork } = useWeb3();
  const { toast } = useToast();

  const sellTokens = async (tokenType: 'CIFI' | 'REFI', tokenAmount: string, tokenAddress: string) => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    const contractAddress = PRIMARY_BUYER_CONTRACTS[tokenType];
    
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      toast({
        title: "Contract Not Deployed",
        description: `${tokenType} Primary Buyer contract is not yet deployed.`,
        variant: "destructive",
      });
      throw new Error('Contract not deployed');
    }

    try {
      // First approve the Primary Buyer contract to spend tokens
      await approveToken(tokenAddress, contractAddress, tokenAmount);

      // Then execute the sell transaction
      const receipt = await executeTransaction(
        contractAddress,
        PRIMARY_BUYER_ABI,
        'sellTokens',
        [tokenAmount]
      );

      toast({
        title: "Sale Successful", 
        description: `Successfully sold ${tokenAmount} ${tokenType} tokens!`,
      });

      return receipt;
    } catch (error: any) {
      toast({
        title: "Sale Failed",
        description: error.message || `Failed to sell ${tokenType} tokens`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUSDCPrice = async (tokenType: 'CIFI' | 'REFI'): Promise<string> => {
    // Placeholder: return mock price for now
    return '1.0'; // 1 Token = 1 USDC (adjust based on actual tokenomics)
  };

  const getUSDCAvailable = async (tokenType: 'CIFI' | 'REFI'): Promise<string> => {
    // Placeholder: return mock USDC availability for now
    return '1000000'; // Mock large number
  };

  return {
    sellTokens,
    getUSDCPrice,
    getUSDCAvailable,
  };
};