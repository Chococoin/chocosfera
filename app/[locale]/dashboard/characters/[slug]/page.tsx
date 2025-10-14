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

interface Story {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentType: 'markdown' | 'html' | 'plaintext';
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  stats?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  isLiked?: boolean;
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
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'history'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: '',
    content: '',
    status: 'draft' as 'draft' | 'published',
    isPublic: false,
  });
  const [isForkingCharacter, setIsForkingCharacter] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [likingStoryId, setLikingStoryId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchCharacter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setLikeCount(data.character.stats.likeCount);

      // Check if user has liked this character
      if (user) {
        fetchLikeStatus(data.character.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleToggleLike = async () => {
    if (!character || isTogglingLike) return;

    try {
      setIsTogglingLike(true);
      const response = await fetch(`/api/characters/${character.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el like');
      }

      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el like');
    } finally {
      setIsTogglingLike(false);
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

  const fetchStories = async () => {
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
  };

  const handleToggleStoryLike = async (storyId: string) => {
    if (likingStoryId) return;

    try {
      setLikingStoryId(storyId);
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el like');
      }

      const data = await response.json();

      // Update story in the list
      setStories(prev => prev.map(story =>
        story.id === storyId
          ? {
              ...story,
              isLiked: data.isLiked,
              stats: {
                ...story.stats,
                viewCount: story.stats?.viewCount || 0,
                commentCount: story.stats?.commentCount || 0,
                likeCount: data.likeCount,
              }
            }
          : story
      ));
    } catch (err) {
      console.error('Error toggling story like:', err);
    } finally {
      setLikingStoryId(null);
    }
  };

  const handleCreateStory = async () => {
    if (!character || !storyForm.title.trim() || !storyForm.content.trim()) {
      setError('Título y contenido son requeridos');
      return;
    }

    try {
      setIsCreatingStory(true);
      setError(null);

      const response = await fetch(`/api/characters/${character.id}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la historia');
      }

      // Reset form
      setStoryForm({
        title: '',
        content: '',
        status: 'draft',
        isPublic: false,
      });
      setShowStoryModal(false);

      // Refresh stories and character data
      await fetchStories();
      await fetchCharacter();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsCreatingStory(false);
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

  const handleFork = async () => {
    if (!character) return;

    try {
      setIsForkingCharacter(true);
      setError(null);

      const response = await fetch(`/api/characters/${character.id}/fork`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al forkear el personaje');
      }

      const data = await response.json();

      // Redirect to the new forked character
      router.push(`/${locale}/dashboard/characters/${data.character.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al forkear');
    } finally {
      setIsForkingCharacter(false);
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
            <div className="flex gap-2">
              {/* Like Button */}
              {user && (
                <button
                  onClick={handleToggleLike}
                  disabled={isTogglingLike}
                  className={`px-4 py-2 backdrop-blur-sm rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isLiked
                      ? 'bg-pink-500/80 hover:bg-pink-600 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isLiked ? 'Quitar like' : 'Dar like'}
                >
                  {isTogglingLike ? (
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  ) : (
                    <span className={isLiked ? 'animate-pulse' : ''}>{isLiked ? '❤️' : '🤍'}</span>
                  )}
                  <span>{likeCount}</span>
                </button>
              )}

              {permissions?.canEdit && (
                <>
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
                </>
              )}
              {permissions?.canFork && !permissions?.canEdit && character.isPublic && (
                <button
                  onClick={handleFork}
                  disabled={isForkingCharacter}
                  className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600 disabled:bg-gray-500/50 backdrop-blur-sm rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isForkingCharacter ? (
                    <>
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Forkeando...
                    </>
                  ) : (
                    <>
                      🔱 Fork
                    </>
                  )}
                </button>
              )}
            </div>
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
              <p className="text-3xl font-bold">{likeCount}</p>
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
              setActiveTab('stories');
              if (stories.length === 0) fetchStories();
            }}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'stories'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📚 Historias ({character.stats.storiesCount})
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
                {character.abilities.map((ability) => (
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
                &ldquo;{character.motto}&rdquo;
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

      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Create Story Button */}
          {permissions?.canEdit && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowStoryModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                ✍️ Nueva Historia
              </button>
            </div>
          )}

          {isLoadingStories && (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-sm text-muted">Cargando historias...</p>
            </div>
          )}

          {!isLoadingStories && stories.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                📚 Aún no hay historias para este personaje
              </p>
              {permissions?.canEdit && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ¡Crea la primera historia para comenzar la aventura!
                </p>
              )}
            </div>
          )}

          {!isLoadingStories && stories.length > 0 && (
            <div className="grid gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {story.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(story.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {story.status === 'draft' && (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-semibold rounded-full">
                          📝 Borrador
                        </span>
                      )}
                      {story.status === 'published' && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-semibold rounded-full">
                          ✅ Publicado
                        </span>
                      )}
                      {story.isPublic && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-semibold rounded-full">
                          🌍 Público
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {story.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {story.contentType === 'markdown' && '📝 Markdown'}
                      {story.contentType === 'html' && '🌐 HTML'}
                      {story.contentType === 'plaintext' && '📄 Texto plano'}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Like Button */}
                      {user && (
                        <button
                          onClick={() => handleToggleStoryLike(story.id)}
                          disabled={likingStoryId === story.id}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                            story.isLiked
                              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={story.isLiked ? 'Quitar like' : 'Dar like'}
                        >
                          {likingStoryId === story.id ? (
                            <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          ) : (
                            <span>{story.isLiked ? '❤️' : '🤍'}</span>
                          )}
                          <span>{story.stats?.likeCount || 0}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                {history.map((commit) => (
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

      {/* Story Creation Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ✍️ Nueva Historia
              </h3>
              <button
                onClick={() => {
                  setShowStoryModal(false);
                  setStoryForm({
                    title: '',
                    content: '',
                    status: 'draft',
                    isPublic: false,
                  });
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">❌ {error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Título de la historia
                </label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, title: e.target.value })
                  }
                  placeholder="Ej: La primera aventura"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Contenido (Markdown)
                </label>
                <textarea
                  value={storyForm.content}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, content: e.target.value })
                  }
                  placeholder="Escribe tu historia aquí... Puedes usar Markdown para formatear el texto."
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  💡 Tip: Usa Markdown para dar formato. Ejemplo: **negrita**,
                  *cursiva*, ## Título
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Estado
                </label>
                <select
                  value={storyForm.status}
                  onChange={(e) =>
                    setStoryForm({
                      ...storyForm,
                      status: e.target.value as 'draft' | 'published',
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">📝 Borrador (no visible)</option>
                  <option value="published">✅ Publicado (visible)</option>
                </select>
              </div>

              {/* Public */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={storyForm.isPublic}
                  onChange={(e) =>
                    setStoryForm({ ...storyForm, isPublic: e.target.checked })
                  }
                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  🌍 Hacer pública esta historia (visible para todos los
                  usuarios)
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowStoryModal(false);
                  setStoryForm({
                    title: '',
                    content: '',
                    status: 'draft',
                    isPublic: false,
                  });
                  setError(null);
                }}
                disabled={isCreatingStory}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateStory}
                disabled={
                  isCreatingStory ||
                  !storyForm.title.trim() ||
                  !storyForm.content.trim()
                }
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingStory ? (
                  <>
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    💾 Crear Historia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
