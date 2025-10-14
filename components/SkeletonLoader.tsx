/**
 * Skeleton Loader Component
 * Creates skeleton loading placeholders
 */

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1rem' : '200px'),
  };

  const skeleton = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );

  if (count === 1) {
    return skeleton;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeleton}</div>
      ))}
    </div>
  );
}

/**
 * Character Card Skeleton
 */
export function CharacterCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <SkeletonLoader variant="circular" width="60px" height="60px" />
        <SkeletonLoader variant="text" width="80px" height="24px" />
      </div>
      <SkeletonLoader variant="text" width="70%" height="24px" />
      <SkeletonLoader variant="text" count={2} />
      <div className="flex items-center gap-4">
        <SkeletonLoader variant="text" width="60px" height="20px" />
        <SkeletonLoader variant="text" width="60px" height="20px" />
        <SkeletonLoader variant="text" width="60px" height="20px" />
      </div>
    </div>
  );
}

/**
 * Story Card Skeleton
 */
export function StoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <SkeletonLoader variant="text" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="60%" height="20px" />
            <SkeletonLoader variant="text" width="40%" height="16px" />
          </div>
        </div>
        <SkeletonLoader variant="text" width="80px" height="24px" />
      </div>
      <SkeletonLoader variant="text" count={3} />
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <SkeletonLoader variant="text" />
        </td>
      ))}
    </tr>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <SkeletonLoader variant="circular" width="40px" height="40px" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader variant="text" width="60%" />
        <SkeletonLoader variant="text" width="40%" />
      </div>
    </div>
  );
}
