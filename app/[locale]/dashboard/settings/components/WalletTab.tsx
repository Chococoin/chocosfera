'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectWallet, WalletBalance } from '@/components/wallet';

export function WalletTab() {
  const { isWeb3Available } = useWallet();
  const { isAdult } = useAuth();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isAdult) {
    return (
      <div className="surface-panel p-8 text-center">
        <span className="text-5xl mb-4 block">🔒</span>
        <h3 className="text-lg font-bold text-heading mb-2">Age Verification Required</h3>
        <p className="text-muted text-sm">
          Wallet features are only available for verified adult accounts.
          Complete your identity verification first.
        </p>
      </div>
    );
  }

  if (!isWeb3Available) {
    return (
      <div className="surface-panel p-8 text-center">
        <span className="text-5xl mb-4 block">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="surface-panel p-6">
        <h3 className="text-lg font-bold text-heading mb-4">Wallet Connection</h3>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Connected</p>
                <p className="text-xs font-mono text-green-600 dark:text-green-400 mt-1">
                  {address}
                </p>
              </div>
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Network</span>
              <span className="text-heading font-medium">{chain?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Chain ID</span>
              <span className="text-heading font-mono">{chain?.id}</span>
            </div>

            <button
              type="button"
              onClick={() => disconnect()}
              className="w-full px-4 py-2 text-sm font-medium rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted text-sm mb-4">
              Connect your wallet to access governance voting, claim USDT distributions, and view on-chain balances.
            </p>
            <ConnectWallet />
          </div>
        )}
      </div>

      {/* Balances */}
      {isConnected && (
        <div className="surface-panel p-6">
          <h3 className="text-lg font-bold text-heading mb-4">Balances</h3>
          <WalletBalance />
        </div>
      )}
    </div>
  );
}
