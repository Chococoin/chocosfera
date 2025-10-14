/**
 * Empty State Component
 * Shows a friendly message when there's no content
 */

import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <span className="text-8xl block mb-6 animate-bounce">{icon}</span>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          {description}
        </p>
      )}
      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {actionLabel}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {actionLabel}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
