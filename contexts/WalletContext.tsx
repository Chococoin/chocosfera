'use client';

/**
 * Wallet Context
 * Provides wallet connection state for ADULT_VERIFIED users only.
 * Parallel to AuthContext — wallet is optional secondary authentication.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { wagmiConfig } from '@/lib/web3/config';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// TYPES
// ============================================

interface WalletContextType {
  isWeb3Available: boolean;
}

// ============================================
// CONTEXT
// ============================================

const WalletContext = createContext<WalletContextType>({ isWeb3Available: false });

const queryClient = new QueryClient();

// ============================================
// PROVIDER
// ============================================

function Web3Wrapper({ children }: { children: ReactNode }) {
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

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isAdult } = useAuth();

  // Only load web3 infrastructure for verified adults
  if (!isAdult) {
    return (
      <WalletContext.Provider value={{ isWeb3Available: false }}>
        {children}
      </WalletContext.Provider>
    );
  }

  return <Web3Wrapper>{children}</Web3Wrapper>;
}

// ============================================
// HOOK
// ============================================

export function useWallet() {
  return useContext(WalletContext);
}
