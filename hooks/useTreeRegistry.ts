/**
 * useTreeRegistry Hook
 * Fetches tree data from the blockchain via API route
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OnChainTree {
  id: number;
  status: string;
  statusCode: number;
  farmer: string;
  adopter: string;
  adoptedAt: string | null;
  locationHash: string;
  lastAuditHash: string;
  lastAuditBlock: number;
}

interface UseTreeRegistryOptions {
  adopter?: string;
  pollInterval?: number;
}

interface UseTreeRegistryReturn {
  trees: OnChainTree[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTreeRegistry({
  adopter,
  pollInterval = 0,
}: UseTreeRegistryOptions = {}): UseTreeRegistryReturn {
  const [trees, setTrees] = useState<OnChainTree[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (adopter) params.set('adopter', adopter);

      const response = await fetch(`/api/blockchain/trees?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trees');

      const data = await response.json();
      if (data.success) {
        setTrees(data.trees || []);
        setTotal(data.total || 0);
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching trees:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trees');
    } finally {
      setIsLoading(false);
    }
  }, [adopter]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  useEffect(() => {
    if (pollInterval <= 0) return;
    const interval = setInterval(fetchTrees, pollInterval);
    return () => clearInterval(interval);
  }, [fetchTrees, pollInterval]);

  return { trees, total, isLoading, error, refetch: fetchTrees };
}

// Timeline events for a specific tree
export interface TreeTimelineEvent {
  type: 'adopted' | 'audit_approved' | 'status_changed';
  blockNumber: number;
  transactionHash: string;
  adopter?: string;
  approver?: string;
  ipfsHash?: string;
  newStatus?: string;
}

interface UseTreeTimelineReturn {
  timeline: TreeTimelineEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useTreeTimeline(treeId: number | null): UseTreeTimelineReturn {
  const [timeline, setTimeline] = useState<TreeTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!treeId) return;
    setIsLoading(true);

    fetch(`/api/blockchain/audits?treeId=${treeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTimeline(data.timeline || []);
          setError(null);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [treeId]);

  return { timeline, isLoading, error };
}
