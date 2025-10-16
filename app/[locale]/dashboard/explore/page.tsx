'use client';

/**
 * Explore Page
 * Discover public characters and stories from the community
 */

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
  isLiked?: boolean;
}

interface Story {
  id: string;
  characterId: string;
  characterName: string;
  characterSlug: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  createdAt: string;
  userId: string;
  stats: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  isLiked?: boolean;
}

type TabType = 'characters' | 'stories';

export default function ExplorePage() {

  const locale = useLocale();
  const t = useTranslations('dashboard.explore');
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likingCharacterId, setLikingCharacterId] = useState<string | null>(null);
  const [likingStoryId, setLikingStoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === 'characters') {
        const response = await fetch('/api/characters?includePublic=true&limit=50');
        if (!response.ok) throw new Error(t('errors.fetchCharacters'));
        const data = await response.json();
        const publicCharacters = data.characters.filter((c: Character) => c.userId !== 'current-user'); // TODO: Filter by actual user

        // Fetch like status for each character
        const charactersWithLikes = await Promise.all(
          publicCharacters.map(async (char: Character) => {
            try {
              const likeResponse = await fetch(`/api/characters/${char.id}/like`);
              if (likeResponse.ok) {
                const likeData = await likeResponse.json();
                return { ...char, isLiked: likeData.isLiked };
              }
            } catch {
              // Ignore errors for individual like checks
            }
            return { ...char, isLiked: false };
          })
        );

        setCharacters(charactersWithLikes);
      } else {
        // Fetch public stories
        const response = await fetch('/api/stories?isPublic=true&status=published&limit=50');
        if (!response.ok) throw new Error(t('errors.fetchStories'));
        const data = await response.json();
        const publicStories = data.stories || [];

        // Fetch like status for each story
        const storiesWithLikes = await Promise.all(
          publicStories.map(async (story: Story) => {
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async (characterId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation when clicking like button
    event.stopPropagation();

    if (likingCharacterId) return;

    try {
      setLikingCharacterId(characterId);
      const response = await fetch(`/api/characters/${characterId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el like');
      }

      const data = await response.json();

      // Update character in the list
      setCharacters(prev => prev.map(char =>
        char.id === characterId
          ? { ...char, isLiked: data.isLiked, stats: { ...char.stats, likeCount: data.likeCount } }
          : char
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLikingCharacterId(null);
    }
  };

  const filteredCharacters = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStories = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.characterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStoryLike = async (storyId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation when clicking like button
    event.stopPropagation();

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
          ? { ...story, isLiked: data.isLiked, stats: { ...story.stats, likeCount: data.likeCount } }
          : story
      ));
    } catch (err) {
      console.error('Error toggling story like:', err);
    } finally {
      setLikingStoryId(null);
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
        return t('types.cacao');
      case 'chocolate':
        return t('types.chocolate');
      case 'farmer':
        return t('types.farmer');
      default:
        return t('types.other');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
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
            placeholder={t('searchPlaceholder')}
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
            🎭 {t('tabs.characters')}
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'stories'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📚 {t('tabs.stories')}
          </button>
        </div>
      </div>

      {/* Canon Characters - Only show on Characters tab */}
      {activeTab === 'characters' && !isLoading && !error && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ⭐ {t('canonCharacters.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('canonCharacters.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pipo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 text-center hover:shadow-lg transition-all">
              <div className="text-5xl mb-3">🌱</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('canonCharacters.pipo.name')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('canonCharacters.pipo.description')}</p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                🔱 {t('canonCharacters.forkThis')}
              </button>
            </div>

            {/* Tony */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 text-center hover:shadow-lg transition-all">
              <div className="text-5xl mb-3">🍫</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('canonCharacters.tony.name')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('canonCharacters.tony.description')}</p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                🔱 {t('canonCharacters.forkThis')}
              </button>
            </div>

            {/* Kaoka */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 text-center hover:shadow-lg transition-all">
              <div className="text-5xl mb-3">👨‍🌾</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('canonCharacters.kaoka.name')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('canonCharacters.kaoka.description')}</p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                🔱 {t('canonCharacters.forkThis')}
              </button>
            </div>
          </div>
        </div>
      )}

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
              title={searchQuery ? t('empty.noCharactersFound') : t('empty.noPublicCharacters')}
              description={
                searchQuery
                  ? t('empty.tryOtherTerms')
                  : t('empty.beFirstCharacter')
              }
              actionLabel={t('empty.createCharacter')}
              actionHref={`/${locale}/dashboard/characters/create`}
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {filteredCharacters.length} {filteredCharacters.length !== 1 ? t('results.charactersPlural') : t('results.character')}{' '}
                {filteredCharacters.length !== 1 ? t('results.foundPlural') : t('results.found')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharacters.map((character) => (
                  <Link
                    key={character.id}
                    href={`/${locale}/dashboard/characters/${character.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all relative"
                  >
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-6xl group-hover:scale-110 transition-transform">
                        {character.assets.icon || getTypeIcon(character.characterType)}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full">
                          {getTypeLabel(character.characterType)}
                        </span>
                        {/* Like Button */}
                        <button
                          onClick={(e) => handleToggleLike(character.id, e)}
                          disabled={likingCharacterId === character.id}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                            character.isLiked
                              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed z-10`}
                          title={character.isLiked ? t('like.remove') : t('like.add')}
                        >
                          {likingCharacterId === character.id ? (
                            <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          ) : (
                            <span>{character.isLiked ? '❤️' : '🤍'}</span>
                          )}
                          <span>{character.stats.likeCount}</span>
                        </button>
                      </div>
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
        <div>
          {filteredStories.length === 0 ? (
            <EmptyState
              icon="📚"
              title={searchQuery ? t('empty.noStoriesFound') : t('empty.noPublicStories')}
              description={
                searchQuery
                  ? t('empty.tryOtherTerms')
                  : t('empty.beFirstStory')
              }
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {filteredStories.length} {filteredStories.length !== 1 ? t('results.storiesPlural') : t('results.story')}{' '}
                {filteredStories.length !== 1 ? t('results.foundPlural') : t('results.found')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/${locale}/dashboard/characters/${story.characterSlug}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📖</span>
                          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full font-semibold">
                            {story.characterName}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {story.title}
                        </h3>
                      </div>
                      {/* Like Button */}
                      <button
                        onClick={(e) => handleToggleStoryLike(story.id, e)}
                        disabled={likingStoryId === story.id}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                          story.isLiked
                            ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed z-10`}
                        title={story.isLiked ? t('like.remove') : t('like.add')}
                      >
                        {likingStoryId === story.id ? (
                          <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                        ) : (
                          <span>{story.isLiked ? '❤️' : '🤍'}</span>
                        )}
                        <span>{story.stats.likeCount}</span>
                      </button>
                    </div>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 mb-4">
                      {story.excerpt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>👁️</span>
                          <span>{story.stats.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💬</span>
                          <span>{story.stats.commentCount}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
