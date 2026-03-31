/**
 * useRoyalties Hook
 * Fetches royalty data for Guardian characters from the RoyaltySplitter contract
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GuardianRoyalty {
  guardianId: number;
  totalRoyalties: string; // USDT amount (6 decimals)
  creatorAddress: string;
  creatorShare: string; // 30%
  poolShare: string; // 70%
  isRegistered: boolean;
}

interface UseRoyaltiesReturn {
  royalties: Map<number, GuardianRoyalty>;
  isLoading: boolean;
  error: string | null;
  getRoyalty: (guardianId: number) => GuardianRoyalty | undefined;
}

export function useRoyalties(guardianIds: number[]): UseRoyaltiesReturn {
  const [royalties, setRoyalties] = useState<Map<number, GuardianRoyalty>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoyalties = useCallback(async () => {
    if (guardianIds.length === 0) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      guardianIds.forEach((id) => params.append('ids', String(id)));

      const response = await fetch(`/api/blockchain/guardians?${params}`);
      if (!response.ok) throw new Error('Failed to fetch royalties');

      const data = await response.json();
      if (data.success) {
        const map = new Map<number, GuardianRoyalty>();
        for (const r of data.royalties) {
          map.set(r.guardianId, r);
        }
        setRoyalties(map);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load royalties');
    } finally {
      setIsLoading(false);
    }
  }, [guardianIds]);

  useEffect(() => {
    fetchRoyalties();
  }, [fetchRoyalties]);

  const getRoyalty = useCallback(
    (guardianId: number) => royalties.get(guardianId),
    [royalties]
  );

  return { royalties, isLoading, error, getRoyalty };
}
