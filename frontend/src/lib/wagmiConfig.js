import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';
import { injected } from 'wagmi/connectors';

// Define Rootstock Testnet chain
export const rootstockTestnet = defineChain({
  id: 31,
  name: 'Rootstock Testnet',
  network: 'rsk-testnet',
  nativeCurrency: {
    name: 'Test Rootstock Bitcoin',
    symbol: 'tRBTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_ROOTSTOCK_RPC || 'https://rpc.testnet.rootstock.io/<YOUR_API_KEY>'],
    },
    public: {
      http: ['https://rpc.testnet.rootstock.io/<YOUR_API_KEY>'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rootstock Explorer',
      url: 'https://explorer.testnet.rootstock.io',
    },
  },
  testnet: true,
});

// Create Wagmi config
export const config = createConfig({
  chains: [rootstockTestnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [rootstockTestnet.id]: http(),
  },
});
