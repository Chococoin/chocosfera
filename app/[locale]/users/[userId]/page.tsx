'use client';

/**
 * Public User Profile Page
 * Shows public information about a user and their characters
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { CharacterCardSkeleton } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';

interface UserProfile {
  id: string;
  nick: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  stats: {
    totalCharacters: number;
    totalPublicCharacters: number;
    totalStories: number;
    totalForks: number;
  };
}

interface Character {
  id: string;
  name: string;
  slug: string;
  characterType: 'cacao' | 'chocolate' | 'farmer' | 'other';
  description: string;
  assets: {
    icon?: string;
  };
  stats: {
    viewCount: number;
    likeCount: number;
    forkCount: number;
    storiesCount: number;
  };
  createdAt: string;
}

export default function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.userId);
    });
  }, [params]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement user profile API
      // For now, simulate with placeholder data
      setError('Perfil de usuario próximamente disponible');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cacao':
        return '🍫';
      case 'chocolate':
        return '🍬';
      case 'farmer':
        return '👨‍🌾';
      default:
        return '🎭';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cacao':
        return 'Cacao';
      case 'chocolate':
        return 'Chocolate';
      case 'farmer':
        return 'Agricultor';
      default:
        return 'Otro';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-6">
              <CharacterCardSkeleton />
            </div>
          </div>
          {/* Characters Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="max-w-md w-full">
          <EmptyState
            icon="⚠️"
            title="Usuario no encontrado"
            description={error}
            actionLabel="Volver al inicio"
            actionHref={`/${locale}/dashboard`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <span>←</span>
          Volver
        </button>

        {userProfile && (
          <>
            {/* User Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Cover */}
              <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

              {/* Profile Info */}
              <div className="p-8">
                <div className="flex items-start gap-6 -mt-20">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.nick}
                        className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-5xl text-white">
                          {userProfile.nick.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 mt-16">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {userProfile.firstName && userProfile.lastName
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : userProfile.nick}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      @{userProfile.nick}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {userProfile.stats.totalPublicCharacters}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          Personajes Públicos
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {userProfile.stats.totalStories}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          Historias
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {userProfile.stats.totalForks}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          Forks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Characters Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Personajes Públicos
              </h2>

              {characters.length === 0 ? (
                <EmptyState
                  icon="🎭"
                  title="Sin personajes públicos"
                  description="Este usuario aún no ha compartido personajes públicos"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((character) => (
                    <Link
                      key={character.id}
                      href={`/${locale}/dashboard/characters/${character.slug}`}
                      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                    >
                      {/* Icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-6xl group-hover:scale-110 transition-transform">
                          {character.assets.icon || getTypeIcon(character.characterType)}
                        </div>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full">
                          {getTypeLabel(character.characterType)}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {character.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                        {character.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>👁️</span>
                          <span>{character.stats.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>❤️</span>
                          <span>{character.stats.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📚</span>
                          <span>{character.stats.storiesCount}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
