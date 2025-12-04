export interface WalletProvider {
  name: string;
  logo: string;
  isAvailable(): Promise<boolean>;
  connect(): Promise<{ provider: any; accounts: string[] }>;
  disconnect(): void;
  getProvider(): any;
  onAccountsChanged(callback: (accounts: string[]) => void): void;
  onChainChanged(callback: (chainId: string) => void): void;
  onDisconnect(callback: () => void): void;
  removeAllListeners(): void;
}

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'dcent';

export interface WalletConfig {
  type: WalletType;
  name: string;
  logo: string;
  description?: string;
  category: 'popular' | 'mobile' | 'hardware' | 'browser';
  isInstallable?: boolean;
  downloadUrl?: string;
}