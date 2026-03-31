'use client';

import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useWallet } from '@/contexts/WalletContext';
import { contracts, participationTokenAbi, erc20Abi } from '@/lib/web3/contracts';
import { formatUnits } from 'viem';

/**
 * Displays wallet balances: ETH, PT, USDT
 * Only renders when wallet is connected.
 */
export function WalletBalance() {
  const { isWeb3Available } = useWallet();
  const { address, isConnected } = useAccount();

  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  const { data: ptBalance } = useReadContract({
    address: contracts.participationToken,
    abi: participationTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { data: usdtBalance } = useReadContract({
    address: contracts.mockUSDT,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  if (!isWeb3Available || !isConnected) return null;

  const balances = [
    {
      label: 'ETH',
      value: ethBalance ? Number(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4) : '0',
      icon: 'E',
    },
    {
      label: 'PT',
      value: ptBalance ? formatUnits(ptBalance as bigint, 18) : '0',
      icon: 'P',
    },
    {
      label: 'USDT',
      value: usdtBalance ? formatUnits(usdtBalance as bigint, 6) : '0',
      icon: '$',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {balances.map((b) => (
        <div
          key={b.label}
          className="surface-panel p-4 text-center"
        >
          <div className="text-2xl font-bold text-heading mb-1">
            {b.value}
          </div>
          <div className="text-xs text-muted font-medium">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
