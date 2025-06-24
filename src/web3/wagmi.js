import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { http } from 'wagmi'

export const config = getDefaultConfig({
  appName: 'tools.simpleweb3.ch',
  projectId: import.meta.env.TOOLS_PROJECT_ID,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});