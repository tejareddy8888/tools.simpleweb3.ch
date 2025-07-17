import { defineChain } from 'viem'

// Define the Hoodi testnet chain
export const hoodi = defineChain({
  id: 560048,
  name: 'Ethereum Hoodi',
  network: 'hoodi',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://ethereum-hoodi-rpc.publicnode.com'],
    },
    public: {
      http: ['https://ethereum-hoodi-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hoodi Explorer',
      url: 'https://hoodi.etherscan.io',
    },
  },
  testnet: true,
})