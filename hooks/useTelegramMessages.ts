/**
 * useTelegramMessages Hook
 * Fetches and polls Telegram messages from MongoDB
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TelegramMessage } from '@/types/telegram';

interface UseTelegramMessagesOptions {
  channelId?: string;
  limit?: number;
  pollInterval?: number; // milliseconds, 0 to disable
}

interface UseTelegramMessagesReturn {
  messages: TelegramMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and poll Telegram messages
 *
 * @example
 * const { messages, isLoading, error, refetch } = useTelegramMessages({
 *   channelId: 'chocosfera_community',
 *   pollInterval: 5000, // Poll every 5 seconds
 * });
 */
export function useTelegramMessages({
  channelId = 'chocosfera_community',
  limit = 50,
  pollInterval = 5000,
}: UseTelegramMessagesOptions = {}): UseTelegramMessagesReturn {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        channelId,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/telegram/messages?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching Telegram messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [channelId, limit]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchMessages, pollInterval]);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages,
  };
}
