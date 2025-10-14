'use client';

/**
 * Characters List Page
 * Shows all user's characters with options to create, view, edit
 */

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Character {
  id: string;
  name: string;
  slug: string;
  characterType: 'cacao' | 'chocolate' | 'farmer' | 'other';
  description: string;
  isPublic: boolean;
  assets: {
    icon?: string;
    avatar?: string;
  };
  stats: {
    viewCount: number;
    likeCount: number;
    storiesCount: number;
    commitsCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CharactersPage() {
  const { user } = useAuth();
  const locale = useLocale();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/characters');

      if (!response.ok) {
        throw new Error('Error al obtener los personajes');
      }

      const data = await response.json();
      setCharacters(data.characters || []);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>🎭</span>
              Mis Personajes
            </h1>
            <p className="text-white/90">
              Crea personajes únicos y cuenta sus historias en la Chocósfera
            </p>
          </div>
          <div className="hidden md:block text-6xl">✨</div>
        </div>
      </div>

      {/* Create Character CTA */}
      {characters.length === 0 && !isLoading && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-8 text-center">
          <span className="text-7xl block mb-4">🎨</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            ¡Tu Aventura Comienza Aquí!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Aún no has creado ningún personaje. Crea tu primer personaje y comienza tu historia en la Chocósfera.
          </p>
          <Link
            href={`/${locale}/dashboard/characters/create`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>✨</span>
            Crear Mi Primer Personaje
          </Link>
        </div>
      )}

      {/* Actions Bar */}
      {characters.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {characters.length}
            </span>{' '}
            personaje{characters.length !== 1 ? 's' : ''}
          </div>
          <Link
            href={`/${locale}/dashboard/characters/create`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <span>+</span>
            Crear Personaje
          </Link>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-center">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Characters Grid */}
      {!isLoading && characters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/${locale}/dashboard/characters/${character.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all hover:scale-105"
            >
              {/* Character Header */}
              <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-7xl">
                  {character.assets.icon || getTypeIcon(character.characterType)}
                </span>
                {character.isPublic && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    🌍 Público
                  </div>
                )}
              </div>

              {/* Character Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {character.name}
                  </h3>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                    {getTypeLabel(character.characterType)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {character.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {character.stats.storiesCount}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Historias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {character.stats.commitsCount}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Commits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {character.stats.viewCount}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vistas</p>
                  </div>
                </div>

                {/* Updated date */}
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                  Actualizado: {new Date(character.updatedAt).toLocaleDateString('es-ES')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>💡</span>
          ¿Qué son los personajes?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Crea personajes únicos con historias propias en la Chocósfera</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Cada personaje tiene su propio repositorio Git con historial</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Puedes hacer fork de Tony, Pipo o Kaoka y crear tu versión</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Comparte tus personajes públicamente o mantenlos privados</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
