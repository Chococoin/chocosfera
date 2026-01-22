'use client';

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (emoji: string) => void;
  isLoading?: boolean;
}

const AVATAR_OPTIONS = [
  '😊', '🎉', '🌟', '🚀', '🎨', '🎭', '🎪', '🎬',
  '🎮', '🎯', '🎲', '🎸', '🍫', '🍪', '🍰', '🧁',
  '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼',
  '🦄', '🦋', '🐝', '🐙', '🦊', '🐻', '🐼', '🐨',
];

export function AvatarSelector({ currentAvatar, onSelect, isLoading = false }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md">
      {AVATAR_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          disabled={isLoading}
          className={`text-2xl p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            currentAvatar === emoji ? 'bg-purple-200 dark:bg-purple-900/50 ring-2 ring-purple-500' : ''
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

interface AvatarDisplayProps {
  avatar: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarDisplay({ avatar, size = 'md' }: AvatarDisplayProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-32 h-32 text-7xl',
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center`}>
      {avatar}
    </div>
  );
}
