'use client';

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  isLoading: boolean;
  onClick: () => void;
  variant?: 'header' | 'card';
}

export function LikeButton({
  isLiked,
  likeCount,
  isLoading,
  onClick,
  variant = 'header',
}: LikeButtonProps) {
  if (variant === 'card') {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
          isLiked
            ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isLiked ? 'Quitar like' : 'Dar like'}
      >
        {isLoading ? (
          <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
        ) : (
          <span>{isLiked ? '❤️' : '🤍'}</span>
        )}
        <span>{likeCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-4 py-2 backdrop-blur-sm rounded-lg font-semibold transition-all flex items-center gap-2 ${
        isLiked
          ? 'bg-pink-500/80 hover:bg-pink-600 text-white'
          : 'bg-white/20 hover:bg-white/30 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isLiked ? 'Quitar like' : 'Dar like'}
    >
      {isLoading ? (
        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
      ) : (
        <span className={isLiked ? 'animate-pulse' : ''}>{isLiked ? '❤️' : '🤍'}</span>
      )}
      <span>{likeCount}</span>
    </button>
  );
}
