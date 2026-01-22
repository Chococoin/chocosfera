'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Character, Permissions } from './types';
import { LikeButton } from './LikeButton';

interface CharacterHeaderProps {
  character: Character;
  permissions: Permissions | null;
  isLiked: boolean;
  likeCount: number;
  isTogglingLike: boolean;
  isForkingCharacter: boolean;
  onToggleLike: () => void;
  onFork: () => void;
  onDelete: () => void;
}

export function CharacterHeader({
  character,
  permissions,
  isLiked,
  likeCount,
  isTogglingLike,
  isForkingCharacter,
  onToggleLike,
  onFork,
  onDelete,
}: CharacterHeaderProps) {
  const locale = useLocale();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cacao': return 'Cacao';
      case 'chocolate': return 'Chocolate';
      case 'farmer': return 'Agricultor';
      default: return 'Otro';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cacao': return '🍫';
      case 'chocolate': return '🍬';
      case 'farmer': return '👨‍🌾';
      default: return '🎭';
    }
  };

  return (
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
            <LikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              isLoading={isTogglingLike}
              onClick={onToggleLike}
            />

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
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-lg font-semibold transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </>
            )}
            {permissions?.canFork && !permissions?.canEdit && character.isPublic && (
              <button
                onClick={onFork}
                disabled={isForkingCharacter}
                className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600 disabled:bg-gray-500/50 backdrop-blur-sm rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isForkingCharacter ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Forkeando...
                  </>
                ) : (
                  <>🔱 Fork</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <CharacterStats character={character} likeCount={likeCount} />
      </div>
    </div>
  );
}

interface CharacterStatsProps {
  character: Character;
  likeCount: number;
}

function CharacterStats({ character, likeCount }: CharacterStatsProps) {
  return (
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
  );
}
