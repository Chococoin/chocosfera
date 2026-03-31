'use client';

/**
 * Web3Wrapper — Lazy-loaded wagmi + RainbowKit provider
 * Only imported dynamically when user is ADULT_VERIFIED
 */

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { wagmiConfig } from '@/lib/web3/config';
import { WalletContext } from './WalletContext';

const queryClient = new QueryClient();

export default function Web3Wrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletContext.Provider value={{ isWeb3Available: true }}>
            {children}
          </WalletContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
