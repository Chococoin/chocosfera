/**
 * Loading Spinner Component
 * Customizable loading spinner with different sizes and colors
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    primary: 'border-purple-600 border-r-transparent',
    white: 'border-white border-r-transparent',
    gray: 'border-gray-600 dark:border-gray-400 border-r-transparent',
  };

  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-solid ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="text-center">
          {spinner}
          {message && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {spinner}
      {message && <span className="text-gray-600 dark:text-gray-400">{message}</span>}
    </div>
  );
}
