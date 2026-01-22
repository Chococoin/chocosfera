'use client';

import { useState, useEffect, useCallback } from 'react';
import { Character, Permissions, Commit, Story } from '../components/types';

interface UseCharacterDataOptions {
  slug: string;
  userId?: string;
}

interface UseCharacterDataReturn {
  character: Character | null;
  permissions: Permissions | null;
  history: Commit[];
  stories: Story[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  isLoadingStories: boolean;
  error: string | null;
  isLiked: boolean;
  likeCount: number;
  fetchHistory: () => Promise<void>;
  fetchStories: () => Promise<void>;
  refreshCharacter: () => Promise<void>;
  setIsLiked: (value: boolean) => void;
  setLikeCount: (value: number) => void;
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
}

export function useCharacterData({ slug, userId }: UseCharacterDataOptions): UseCharacterDataReturn {
  const [character, setCharacter] = useState<Character | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [history, setHistory] = useState<Commit[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const fetchLikeStatus = async (characterId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/like`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.error('Error checking like status:', err);
    }
  };

  const fetchCharacter = useCallback(async () => {
    if (!slug) return;

    try {
      setIsLoading(true);
      setError(null);

      // First, get all characters to find the ID from slug
      const listResponse = await fetch('/api/characters');
      if (!listResponse.ok) {
        throw new Error('Error al obtener personajes');
      }

      const listData = await listResponse.json();
      const foundCharacter = listData.characters.find(
        (c: Character) => c.slug === slug
      );

      if (!foundCharacter) {
        throw new Error('Personaje no encontrado');
      }

      // Now fetch the full character details
      const response = await fetch(`/api/characters/${foundCharacter.id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el personaje');
      }

      const data = await response.json();
      setCharacter(data.character);
      setPermissions(data.permissions);
      setLikeCount(data.character.stats.likeCount);

      // Check if user has liked this character
      if (userId) {
        fetchLikeStatus(data.character.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [slug, userId]);

  const fetchHistory = useCallback(async () => {
    if (!character) return;

    try {
      setIsLoadingHistory(true);
      const response = await fetch(
        `/api/characters/${character.id}/history?limit=20`
      );

      if (!response.ok) {
        throw new Error('Error al obtener el historial');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [character]);

  const fetchStories = useCallback(async () => {
    if (!character) return;

    try {
      setIsLoadingStories(true);
      const response = await fetch(
        `/api/characters/${character.id}/stories?limit=50`
      );

      if (!response.ok) {
        throw new Error('Error al obtener las historias');
      }

      const data = await response.json();
      const fetchedStories = data.stories || [];

      // Fetch like status for each story
      const storiesWithLikes = await Promise.all(
        fetchedStories.map(async (story: Story) => {
          try {
            const likeResponse = await fetch(`/api/stories/${story.id}/like`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              return { ...story, isLiked: likeData.isLiked };
            }
          } catch {
            // Ignore errors for individual like checks
          }
          return { ...story, isLiked: false };
        })
      );

      setStories(storiesWithLikes);
    } catch (err) {
      console.error('Error loading stories:', err);
      setStories([]);
    } finally {
      setIsLoadingStories(false);
    }
  }, [character]);

  useEffect(() => {
    if (slug) {
      fetchCharacter();
    }
  }, [slug, fetchCharacter]);

  return {
    character,
    permissions,
    history,
    stories,
    isLoading,
    isLoadingHistory,
    isLoadingStories,
    error,
    isLiked,
    likeCount,
    fetchHistory,
    fetchStories,
    refreshCharacter: fetchCharacter,
    setIsLiked,
    setLikeCount,
    setStories,
  };
}
