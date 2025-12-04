import { WalletProvider } from '@/types/wallet';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
    };
  }
}

export class CoinbaseProvider implements WalletProvider {
  name = 'Coinbase Wallet';
  logo = '/image-uploads/coinbase-logo.svg';
  private provider: InstanceType<typeof EthereumProvider> | null = null;

  async isAvailable(): Promise<boolean> {
    // Check if Coinbase Wallet extension is installed
    if (typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet) {
      return true;
    }
    // Always available through WalletConnect as fallback
    return true;
  }

  async connect(): Promise<{ provider: any; accounts: string[] }> {
    try {
      // Try native Coinbase Wallet first
      if (typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return { provider: window.ethereum, accounts };
      }

      // Fallback to WalletConnect
      this.provider = await EthereumProvider.init({
        projectId: '5bf13870390b017a453b0e7eac23c2ec',
        chains: [50], // XDC Network chain ID
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
        },
        metadata: {
          name: 'CIFI & REFI Migration Portal',
          description: 'Migrate your tokens to XDC Network',
          url: window.location.origin,
          icons: ['/favicon.ico']
        }
      });

      await this.provider.connect();
      const accounts = this.provider.accounts;
      
      return { provider: this.provider, accounts };
    } catch (error) {
      throw new Error('Failed to connect with Coinbase Wallet');
    }
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
  }

  getProvider(): any {
    return this.provider || (typeof window !== 'undefined' ? window.ethereum : null);
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    const provider = this.getProvider();
    if (provider) {
      provider.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    const provider = this.getProvider();
    if (provider) {
      provider.on('chainChanged', callback);
    }
  }

  onDisconnect(callback: () => void): void {
    const provider = this.getProvider();
    if (provider) {
      provider.on('disconnect', callback);
    }
  }

  removeAllListeners(): void {
    const provider = this.getProvider();
    if (provider && provider.removeAllListeners) {
      provider.removeAllListeners('accountsChanged');
      provider.removeAllListeners('chainChanged');
      provider.removeAllListeners('disconnect');
    }
  }
}