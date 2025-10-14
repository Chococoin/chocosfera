'use client';

/**
 * Character Detail Page
 * Shows character information, stats, stories, and Git history
 */

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface Character {
  id: string;
  name: string;
  slug: string;
  characterType: 'cacao' | 'chocolate' | 'farmer' | 'other';
  description: string;
  personality: string;
  abilities: string[];
  motto: string;
  isPublic: boolean;
  isFork: boolean;
  forkedCharacter?: string;
  assets: {
    icon?: string;
    avatar?: string;
    banner?: string;
  };
  stats: {
    viewCount: number;
    likeCount: number;
    forkCount: number;
    storiesCount: number;
    commitsCount: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  gitRepo: string;
  gitPath: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  email: string;
  date: string;
  diff?: string;
}

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canFork: boolean;
}

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [slug, setSlug] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [history, setHistory] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchCharacter();
    }
  }, [slug]);

  const fetchCharacter = async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
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
  };

  const handleDelete = async () => {
    if (!character || !permissions?.canDelete) return;

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el personaje');
      }

      router.push(`/${locale}/dashboard/characters`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24)
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return formatDate(dateString);
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200 mb-4">
            ❌ {error || 'Personaje no encontrado'}
          </p>
          <Link
            href={`/${locale}/dashboard/characters`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Volver a Mis Personajes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link
        href={`/${locale}/dashboard/characters`}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <span>←</span>
        Volver a Mis Personajes
      </Link>

      {/* Character Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white overflow-hidden">
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-r from-purple-700 to-pink-700 flex items-center justify-center">
          <span className="text-8xl">
            {character.assets.icon || getTypeIcon(character.characterType)}
          </span>
          {character.isPublic && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
              🌍 Público
            </div>
          )}
          {character.isFork && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
              🔱 Fork de {character.forkedCharacter || 'otro personaje'}
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                {getTypeLabel(character.characterType)}
              </span>
            </div>
            {permissions?.canEdit && (
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/dashboard/characters/${character.slug}/edit`}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-colors"
                >
                  ✏️ Editar
                </Link>
                {permissions?.canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-lg font-semibold transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{character.stats.storiesCount}</p>
              <p className="text-sm text-white/80">Historias</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{character.stats.commitsCount}</p>
              <p className="text-sm text-white/80">Commits</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{character.stats.viewCount}</p>
              <p className="text-sm text-white/80">Vistas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{character.stats.likeCount}</p>
              <p className="text-sm text-white/80">Me gusta</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{character.stats.forkCount}</p>
              <p className="text-sm text-white/80">Forks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Eliminar personaje?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta acción marcará el personaje como eliminado. ¿Estás seguro de que
              quieres continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📋 Información General
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              if (history.length === 0) fetchHistory();
            }}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📜 Historial Git
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Descripción
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {character.description}
            </p>
          </div>

          {/* Personality */}
          {character.personality && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Personalidad
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {character.personality}
              </p>
            </div>
          )}

          {/* Abilities */}
          {character.abilities && character.abilities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Habilidades Especiales
              </h2>
              <ul className="space-y-3">
                {character.abilities.map((ability, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  >
                    <span className="text-2xl">✨</span>
                    <span className="text-gray-800 dark:text-gray-200 flex-1">
                      {ability}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motto */}
          {character.motto && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">
                Lema
              </h2>
              <p className="text-lg text-amber-800 dark:text-amber-200 italic font-semibold">
                "{character.motto}"
              </p>
            </div>
          )}

          {/* Git Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Información de Repositorio
            </h2>
            <div className="space-y-3 font-mono text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Path: </span>
                <span className="text-gray-900 dark:text-white">
                  {character.gitPath}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Último commit:{' '}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {character.lastCommitSha.substring(0, 7)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Mensaje: </span>
                <span className="text-gray-900 dark:text-white">
                  {character.lastCommitMessage}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Fecha: </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(character.lastCommitDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Metadata
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Creado: </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(character.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Actualizado:{' '}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(character.updatedAt)}
                </span>
              </div>
              {character.publishedAt && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Publicado:{' '}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(character.publishedAt)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-gray-400">Slug: </span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {character.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {isLoadingHistory && (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-sm text-muted">Cargando historial...</p>
            </div>
          )}

          {!isLoadingHistory && history.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-200">
                📭 No hay commits en el historial todavía
              </p>
            </div>
          )}

          {!isLoadingHistory && history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Historial de Commits ({character.stats.commitsCount} total)
              </h2>
              <div className="space-y-4">
                {history.map((commit, index) => (
                  <div
                    key={commit.sha}
                    className="border-l-4 border-purple-500 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatRelativeTime(commit.date)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-900 dark:text-white font-semibold mb-1">
                      {commit.message}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {commit.author} ({commit.email})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
