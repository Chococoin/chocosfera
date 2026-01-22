'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { TabNavigation, TabPanel, ConfirmModal, CardSkeleton, Alert } from '@/components/ui';
import {
  CharacterHeader,
  OverviewTab,
  StoriesTab,
  HistoryTab,
  StoryCreationModal,
  StoryFormData,
  Story,
} from './components';
import { useCharacterData } from './hooks';

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [slug, setSlug] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'history'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [isForkingCharacter, setIsForkingCharacter] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [likingStoryId, setLikingStoryId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  const {
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
    refreshCharacter,
    setIsLiked,
    setLikeCount,
    setStories,
  } = useCharacterData({ slug, userId: user?.id });

  const tabs = [
    { id: 'overview', label: 'Información General', icon: '📋' },
    { id: 'stories', label: `Historias (${character?.stats.storiesCount || 0})`, icon: '📚' },
    { id: 'history', label: 'Historial Git', icon: '📜' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'overview' | 'stories' | 'history');
    if (tabId === 'stories' && stories.length === 0) {
      fetchStories();
    } else if (tabId === 'history' && history.length === 0) {
      fetchHistory();
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
    } finally {
      setIsTogglingLike(false);
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

      setStories((prev: Story[]) => prev.map((story: Story) =>
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

  const handleCreateStory = async (formData: StoryFormData) => {
    if (!character || !formData.title.trim() || !formData.content.trim()) {
      setStoryError('Título y contenido son requeridos');
      return;
    }

    try {
      setIsCreatingStory(true);
      setStoryError(null);

      const response = await fetch(`/api/characters/${character.id}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la historia');
      }

      setShowStoryModal(false);
      await fetchStories();
      await refreshCharacter();
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : 'Error desconocido');
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
      console.error('Error deleting character:', err);
    }
  };

  const handleFork = async () => {
    if (!character) return;

    try {
      setIsForkingCharacter(true);

      const response = await fetch(`/api/characters/${character.id}/fork`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al forkear el personaje');
      }

      const data = await response.json();
      router.push(`/${locale}/dashboard/characters/${data.character.slug}`);
    } catch (err) {
      console.error('Error forking character:', err);
    } finally {
      setIsForkingCharacter(false);
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

  if (isLoading) {
    return (
      <div className="p-6">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="p-6">
        <Alert variant="error" className="text-center">
          <p className="mb-4">{error || 'Personaje no encontrado'}</p>
          <Link
            href={`/${locale}/dashboard/characters`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Volver a Mis Personajes
          </Link>
        </Alert>
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
      <CharacterHeader
        character={character}
        permissions={permissions}
        isLiked={isLiked}
        likeCount={likeCount}
        isTogglingLike={isTogglingLike}
        isForkingCharacter={isForkingCharacter}
        onToggleLike={handleToggleLike}
        onFork={handleFork}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar personaje?"
        message="Esta acción marcará el personaje como eliminado. ¿Estás seguro de que quieres continuar?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="underline"
      />

      {/* Tab Content */}
      <TabPanel activeTab={activeTab} tabId="overview">
        <OverviewTab character={character} />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="stories">
        <StoriesTab
          stories={stories}
          permissions={permissions}
          isLoading={isLoadingStories}
          likingStoryId={likingStoryId}
          onCreateStory={() => setShowStoryModal(true)}
          onToggleLike={handleToggleStoryLike}
        />
      </TabPanel>

      <TabPanel activeTab={activeTab} tabId="history">
        <HistoryTab
          history={history}
          character={character}
          isLoading={isLoadingHistory}
        />
      </TabPanel>

      {/* Story Creation Modal */}
      <StoryCreationModal
        isOpen={showStoryModal}
        onClose={() => {
          setShowStoryModal(false);
          setStoryError(null);
        }}
        onSubmit={handleCreateStory}
        isSubmitting={isCreatingStory}
        error={storyError}
      />
    </div>
  );
}
