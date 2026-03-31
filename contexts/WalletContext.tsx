'use client';

/**
 * Wallet Context
 * Provides wallet connection state for ADULT_VERIFIED users only.
 * Lazy-loads wagmi/RainbowKit to avoid blocking initial page load.
 */

import React, { createContext, useContext, ReactNode, lazy, Suspense, useMemo } from 'react';
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

// Lazy-load the heavy web3 wrapper (wagmi + RainbowKit + react-query)
const Web3Wrapper = lazy(() => import('./Web3Wrapper'));

// ============================================
// PROVIDER
// ============================================

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

  return (
    <Suspense fallback={
      <WalletContext.Provider value={{ isWeb3Available: false }}>
        {children}
      </WalletContext.Provider>
    }>
      <Web3Wrapper>
        {children}
      </Web3Wrapper>
    </Suspense>
  );
}

// ============================================
// HOOK
// ============================================

export function useWallet() {
  return useContext(WalletContext);
}

export { WalletContext };
