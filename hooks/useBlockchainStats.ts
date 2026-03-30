/**
 * useBlockchainStats Hook
 * Fetches aggregate blockchain stats for the dashboard
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BlockchainStats {
  totalTrees: number;
  adoptedTrees: number;
  uniqueFarmers: number;
  co2Offset: string;
  ptTotalSupply: string;
}

export interface UserBlockchainStats {
  ptBalance: string;
  referralCount: number;
}

interface UseBlockchainStatsReturn {
  stats: BlockchainStats | null;
  userStats: UserBlockchainStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBlockchainStats(walletAddress?: string): UseBlockchainStatsReturn {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [userStats, setUserStats] = useState<UserBlockchainStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (walletAddress) params.set('wallet', walletAddress);

      const response = await fetch(`/api/blockchain/stats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setUserStats(data.userStats || null);
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error fetching blockchain stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, userStats, isLoading, error, refetch: fetchStats };
}
