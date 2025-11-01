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
      http: [import.meta.env.VITE_ROOTSTOCK_RPC || 'https://public-node.testnet.rsk.co'],
    },
    public: {
      http: ['https://public-node.testnet.rsk.co'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: 'https://explorer.testnet.rsk.co',
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
