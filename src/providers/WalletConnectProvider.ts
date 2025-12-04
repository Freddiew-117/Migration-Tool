import { WalletProvider } from '@/types/wallet';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

export class WalletConnectProvider implements WalletProvider {
  name = 'WalletConnect';
  logo = '/image-uploads/walletconnect-logo.svg'; // We'll need to add this logo
  private provider: InstanceType<typeof EthereumProvider> | null = null;

  async isAvailable(): Promise<boolean> {
    // WalletConnect is always available as it works through QR code
    return true;
  }

  async connect(): Promise<{ provider: any; accounts: string[] }> {
    try {
      this.provider = await EthereumProvider.init({
        projectId: '5bf13870390b017a453b0e7eac23c2ec',
        chains: [50], // XDC Network chain ID
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'light',
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
      throw new Error('Failed to connect with WalletConnect');
    }
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
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
      this.provider.on('chainChanged', (chainId: string) => {
        callback(chainId);
      });
    }
  }

  onDisconnect(callback: () => void): void {
    if (this.provider) {
      this.provider.on('disconnect', callback);
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      // WalletConnect provider handles cleanup on disconnect
      // No manual removal needed as listeners are bound to provider instance
    }
  }
}