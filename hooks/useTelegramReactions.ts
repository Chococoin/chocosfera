/**
 * useTelegramReactions Hook
 * Handles adding and removing reactions to Telegram messages
 */

'use client';

import { useState, useCallback } from 'react';
import type { AddReactionInput, RemoveReactionInput } from '@/types/telegram';

interface UseTelegramReactionsReturn {
  addReaction: (input: AddReactionInput) => Promise<boolean>;
  removeReaction: (input: RemoveReactionInput) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to handle Telegram message reactions
 *
 * @example
 * const { addReaction, removeReaction, isLoading } = useTelegramReactions();
 *
 * // Add reaction
 * await addReaction({
 *   messageId: 'msg_123',
 *   userId: 'user_1',
 *   userName: 'Carlos',
 *   userAvatar: '👨‍🌾',
 *   reactionType: '❤️',
 * });
 *
 * // Remove reaction
 * await removeReaction({
 *   messageId: 'msg_123',
 *   userId: 'user_1',
 *   reactionType: '❤️',
 * });
 */
export function useTelegramReactions(): UseTelegramReactionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a reaction to a message
   */
  const addReaction = useCallback(async (input: AddReactionInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/telegram/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add reaction');
      }

      return true;
    } catch (err) {
      console.error('Error adding reaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove a reaction from a message
   */
  const removeReaction = useCallback(async (input: RemoveReactionInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/telegram/reactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove reaction');
      }

      return true;
    } catch (err) {
      console.error('Error removing reaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove reaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addReaction,
    removeReaction,
    isLoading,
    error,
  };
}
