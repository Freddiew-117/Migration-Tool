import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
// Web3Context doesn't need database access
import { useToast } from '@/hooks/use-toast';
import { WalletType, WalletProvider as IWalletProvider } from '@/types/wallet';
import { MetaMaskProvider } from '@/providers/MetaMaskProvider';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import { CoinbaseProvider } from '@/providers/CoinbaseProvider';
import { DCentProvider } from '@/providers/DCentProvider';

interface Web3ContextType {
  provider: BrowserProvider | null;
  account: string | null;
  chainId: number | null;
  selectedWallet: WalletType | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connecting: boolean;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  switchToXDCNetwork: () => Promise<void>;
  getTokenBalance: (tokenAddress: string) => Promise<string>;
  getTokenAllowance: (tokenAddress: string, spenderAddress: string) => Promise<string>;
  approveToken: (tokenAddress: string, spenderAddress: string, amount: string) => Promise<void>;
  executeTransaction: (contractAddress: string, abi: any[], method: string, params: any[]) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

const XDC_NETWORK = {
  chainId: 50,
  chainName: 'XDC Network',
  nativeCurrency: {
    name: 'XDC',
    symbol: 'XDC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.xinfin.network'],
  blockExplorerUrls: ['https://explorer.xinfin.network/'],
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [walletProvider, setWalletProvider] = useState<IWalletProvider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const isConnected = !!account && !!provider;
  const isCorrectNetwork = chainId === XDC_NETWORK.chainId;

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      try {
        // Try to reconnect with MetaMask first (backward compatibility)
        const storedWallet = localStorage.getItem('selectedWallet') as WalletType;
        if (storedWallet) {
          await connectWallet(storedWallet);
        } else {
          // Legacy check for MetaMask
          const metamask = new MetaMaskProvider();
          if (await metamask.isAvailable()) {
            const metamaskProvider = metamask.getProvider();
            if (metamaskProvider && (metamaskProvider as any).selectedAddress) {
              await connectWallet('metamask');
            }
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async (walletType: WalletType = 'metamask') => {
    if (connecting) return;
    
    setConnecting(true);
    try {
      let walletProviderInstance: IWalletProvider;
      
      switch (walletType) {
        case 'metamask':
          walletProviderInstance = new MetaMaskProvider();
          break;
        case 'walletconnect':
          walletProviderInstance = new WalletConnectProvider();
          break;
        case 'coinbase':
          walletProviderInstance = new CoinbaseProvider();
          break;
        case 'dcent':
          walletProviderInstance = new DCentProvider();
          break;
        default:
          throw new Error('Unsupported wallet type');
      }

      const isAvailable = await walletProviderInstance.isAvailable();
      if (!isAvailable && walletType === 'metamask') {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        return;
      }

      const { provider: ethProvider, accounts } = await walletProviderInstance.connect();
      const web3Provider = new BrowserProvider(ethProvider);
      const network = await web3Provider.getNetwork();
      
      setProvider(web3Provider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setSelectedWallet(walletType);
      setWalletProvider(walletProviderInstance);

      // Store wallet preference
      localStorage.setItem('selectedWallet', walletType);

      // Set up event listeners
      walletProviderInstance.onAccountsChanged((accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      walletProviderInstance.onChainChanged((chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });

      walletProviderInstance.onDisconnect(() => {
        disconnectWallet();
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });

      // Auto-switch to XDC if on wrong network
      if (Number(network.chainId) !== XDC_NETWORK.chainId) {
        await switchToXDCNetwork();
      }

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (walletProvider) {
      walletProvider.disconnect();
      walletProvider.removeAllListeners();
      setWalletProvider(null);
    }
    setProvider(null);
    setAccount(null);
    setChainId(null);
    setSelectedWallet(null);
    localStorage.removeItem('selectedWallet');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const switchToXDCNetwork = async () => {
    try {
      if (!walletProvider) return;

      const ethProvider = walletProvider.getProvider();
      if (!ethProvider) return;

      try {
        await (ethProvider as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${XDC_NETWORK.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          await (ethProvider as any).request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${XDC_NETWORK.chainId.toString(16)}`,
              chainName: XDC_NETWORK.chainName,
              nativeCurrency: XDC_NETWORK.nativeCurrency,
              rpcUrls: XDC_NETWORK.rpcUrls,
              blockExplorerUrls: XDC_NETWORK.blockExplorerUrls,
            }],
          });
        } else {
          throw switchError;
        }
      }

      toast({
        title: "Network Switched",
        description: "Switched to XDC Network successfully.",
      });
    } catch (error: any) {
      console.error('Error switching network:', error);
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch to XDC Network",
        variant: "destructive",
      });
    }
  };

  const getTokenBalance = async (tokenAddress: string): Promise<string> => {
    if (!provider || !account) return '0';
    
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(account);
      return formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

  const getTokenAllowance = async (tokenAddress: string, spenderAddress: string): Promise<string> => {
    if (!provider || !account) return '0';
    
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await contract.allowance(account, spenderAddress);
      return formatUnits(allowance, 18);
    } catch (error) {
      console.error('Error getting token allowance:', error);
      return '0';
    }
  };

  const approveToken = async (tokenAddress: string, spenderAddress: string, amount: string): Promise<void> => {
    if (!provider || !account) throw new Error('Wallet not connected');
    
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await contract.approve(spenderAddress, parseUnits(amount, 18));
      
      toast({
        title: "Approval Submitted",
        description: "Transaction submitted. Please wait for confirmation.",
      });
      
      await tx.wait();
      
      toast({
        title: "Approval Confirmed",
        description: "Token approval confirmed on blockchain.",
      });
    } catch (error: any) {
      console.error('Error approving token:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve token",
        variant: "destructive",
      });
      throw error;
    }
  };

  const executeTransaction = async (contractAddress: string, abi: any[], method: string, params: any[]): Promise<any> => {
    if (!provider || !account) throw new Error('Wallet not connected');
    
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);
      const tx = await contract[method](...params);
      
      toast({
        title: "Transaction Submitted",
        description: "Transaction submitted. Please wait for confirmation.",
      });
      
      const receipt = await tx.wait();
      
      toast({
        title: "Transaction Confirmed",
        description: "Transaction confirmed on blockchain.",
      });
      
      return receipt;
    } catch (error: any) {
      console.error('Error executing transaction:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    provider,
    account,
    chainId,
    selectedWallet,
    isConnected,
    isCorrectNetwork,
    connecting,
    connectWallet,
    disconnectWallet,
    switchToXDCNetwork,
    getTokenBalance,
    getTokenAllowance,
    approveToken,
    executeTransaction,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};