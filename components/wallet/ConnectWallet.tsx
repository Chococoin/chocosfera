'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Wallet connect button — only renders for ADULT_VERIFIED users.
 * Uses RainbowKit's ConnectButton with custom rendering.
 */
export function ConnectWallet() {
  const { isWeb3Available } = useWallet();
  const { isAdult } = useAuth();

  if (!isAdult || !isWeb3Available) return null;

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none' as const, userSelect: 'none' as const },
            })}
          >
            {!connected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className="px-4 py-2 text-sm font-medium rounded-2xl border border-[var(--color-border)] text-heading hover:bg-gradient-to-r hover:from-[rgba(223,134,170,0.1)] hover:to-[rgba(87,41,214,0.1)] transition-all"
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                type="button"
                onClick={openChainModal}
                className="px-4 py-2 text-sm font-medium rounded-2xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              >
                Wrong Network
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openChainModal}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--color-border)] text-muted hover:text-heading transition-all"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name ?? ''} className="w-3 h-3 rounded-full" />
                  )}
                  {chain.name}
                </button>
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl border border-[var(--color-border)] text-heading hover:bg-[rgba(223,134,170,0.08)] transition-all"
                >
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
