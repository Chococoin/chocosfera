import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';

// Local Anvil chain (dev) — matches our DeployLocal.s.sol deployment
export const anvilLocal = defineChain({
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545'] },
  },
});

export const wagmiConfig = createConfig({
  chains: [anvilLocal],
  transports: {
    [anvilLocal.id]: http(),
  },
  ssr: true,
});
