'use client';

import { Story } from './types';
import { Card, StatusBadge } from '@/components/ui';
import { LikeButton } from './LikeButton';

interface StoryCardProps {
  story: Story;
  index: number;
  isLiking: boolean;
  onToggleLike: (storyId: string) => void;
}

export function StoryCard({ story, index, isLiking, onToggleLike }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card hover>
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
            <StatusBadge variant="warning" icon="📝">
              Borrador
            </StatusBadge>
          )}
          {story.status === 'published' && (
            <StatusBadge variant="success" icon="✅">
              Publicado
            </StatusBadge>
          )}
          {story.isPublic && (
            <StatusBadge variant="info" icon="🌍">
              Público
            </StatusBadge>
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
        <LikeButton
          isLiked={story.isLiked || false}
          likeCount={story.stats?.likeCount || 0}
          isLoading={isLiking}
          onClick={() => onToggleLike(story.id)}
          variant="card"
        />
      </div>
    </Card>
  );
}
