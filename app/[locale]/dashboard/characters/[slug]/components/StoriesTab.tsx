'use client';

import { Story, Permissions } from './types';
import { StoryCard } from './StoryCard';
import { LoadingState, Alert } from '@/components/ui';

interface StoriesTabProps {
  stories: Story[];
  permissions: Permissions | null;
  isLoading: boolean;
  likingStoryId: string | null;
  onCreateStory: () => void;
  onToggleLike: (storyId: string) => void;
}

export function StoriesTab({
  stories,
  permissions,
  isLoading,
  likingStoryId,
  onCreateStory,
  onToggleLike,
}: StoriesTabProps) {
  if (isLoading) {
    return <LoadingState message="Cargando historias..." />;
  }

  return (
    <div className="space-y-6">
      {/* Create Story Button */}
      {permissions?.canEdit && (
        <div className="flex justify-end">
          <button
            onClick={onCreateStory}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            ✍️ Nueva Historia
          </button>
        </div>
      )}

      {stories.length === 0 ? (
        <Alert variant="warning" icon="📚">
          <p className="mb-2">Aún no hay historias para este personaje</p>
          {permissions?.canEdit && (
            <p className="text-sm opacity-80">
              ¡Crea la primera historia para comenzar la aventura!
            </p>
          )}
        </Alert>
      ) : (
        <div className="grid gap-6">
          {stories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              isLiking={likingStoryId === story.id}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
