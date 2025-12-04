import { WalletProvider } from '@/types/wallet';
import detectEthereumProvider from '@metamask/detect-provider';

export class MetaMaskProvider implements WalletProvider {
  name = 'MetaMask';
  logo = '/image-uploads/metamask-logo.svg';
  private provider: any = null;

  async isAvailable(): Promise<boolean> {
    try {
      const provider = await detectEthereumProvider();
      return !!provider && provider.isMetaMask;
    } catch {
      return false;
    }
  }

  async connect(): Promise<{ provider: any; accounts: string[] }> {
    const provider = await detectEthereumProvider();
    
    if (!provider || !provider.isMetaMask) {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }

    this.provider = provider;
    const accounts = await (provider as any).request({ method: 'eth_requestAccounts' });
    
    return { provider, accounts };
  }

  disconnect(): void {
    this.provider = null;
    // MetaMask doesn't have a programmatic disconnect method
  }

  getProvider(): any {
    return this.provider;
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (this.provider) {
      this.provider.on('chainChanged', callback);
    }
  }

  onDisconnect(callback: () => void): void {
    if (this.provider) {
      this.provider.on('disconnect', callback);
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      this.provider.removeAllListeners('accountsChanged');
      this.provider.removeAllListeners('chainChanged');
      this.provider.removeAllListeners('disconnect');
    }
  }
}