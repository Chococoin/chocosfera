/**
 * useGovernance Hook
 * Fetches proposal data from HybridVoting contract
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Proposal {
  id: number;
  title: string;
  numOptions: number;
  endTimestamp: number;
  createdTimestamp: number;
  isActive: boolean;
  isExpired: boolean;
  transactionHash: string;
  blockNumber: number;
}

interface UseGovernanceReturn {
  proposals: Proposal[];
  totalProposals: number;
  thresholdPct: number;
  activeCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGovernance(): UseGovernanceReturn {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [totalProposals, setTotalProposals] = useState(0);
  const [thresholdPct, setThresholdPct] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGovernance = useCallback(async () => {
    try {
      const response = await fetch('/api/blockchain/governance');
      if (!response.ok) throw new Error('Failed to fetch governance data');

      const data = await response.json();
      if (data.success) {
        setProposals(data.proposals || []);
        setTotalProposals(data.totalProposals || 0);
        setThresholdPct(data.thresholdPct || 50);
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load governance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGovernance();
  }, [fetchGovernance]);

  const activeCount = proposals.filter((p) => p.isActive).length;

  return { proposals, totalProposals, thresholdPct, activeCount, isLoading, error, refetch: fetchGovernance };
}
