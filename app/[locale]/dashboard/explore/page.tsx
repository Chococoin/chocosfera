'use client';

/**
 * Explore Page
 * Discover public characters and stories from the community
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { CharacterCardSkeleton } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';

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
  userId: string;
  createdAt: string;
}

interface Story {
  id: string;
  characterId: string;
  title: string;
  excerpt: string;
  createdAt: string;
  userId: string;
}

type TabType = 'characters' | 'stories';

export default function ExplorePage() {
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === 'characters') {
        const response = await fetch('/api/characters?includePublic=true&limit=50');
        if (!response.ok) throw new Error('Error al obtener personajes');
        const data = await response.json();
        setCharacters(data.characters.filter((c: Character) => c.userId !== 'current-user')); // TODO: Filter by actual user
      } else {
        // TODO: Implement stories API
        setStories([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCharacters = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explorar Chocósfera
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Descubre personajes e historias de la comunidad
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar personajes, historias, usuarios..."
            className="w-full px-6 py-4 pl-14 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'characters'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🎭 Personajes
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'stories'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📚 Historias
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CharacterCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200">❌ {error}</p>
        </div>
      )}

      {/* Characters Grid */}
      {activeTab === 'characters' && !isLoading && !error && (
        <div>
          {filteredCharacters.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={searchQuery ? 'No se encontraron personajes' : 'No hay personajes públicos'}
              description={
                searchQuery
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Sé el primero en compartir un personaje público con la comunidad'
              }
              actionLabel="Crear mi personaje"
              actionHref={`/${locale}/dashboard/characters/create`}
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {filteredCharacters.length} personaje{filteredCharacters.length !== 1 ? 's' : ''}{' '}
                encontrado{filteredCharacters.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharacters.map((character) => (
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
                      <div className="flex items-center gap-1">
                        <span>🔱</span>
                        <span>{character.stats.forkCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Stories Grid */}
      {activeTab === 'stories' && !isLoading && !error && (
        <EmptyState
          icon="🚧"
          title="Próximamente"
          description="La exploración de historias estará disponible muy pronto. Mantente atento!"
        />
      )}
    </div>
  );
}
