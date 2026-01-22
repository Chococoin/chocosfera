import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  gradient?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      loading = false,
      fullWidth = false,
      gradient = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const gradientStyles = gradient
      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg'
      : variantStyles[variant];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${gradientStyles} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
        ) : (
          icon
        )}
        {children}
        {iconRight}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Convenience button components
interface ActionButtonProps extends Omit<ButtonProps, 'variant'> {
  label: string;
}

export function PrimaryButton({ label, ...props }: ActionButtonProps) {
  return <Button variant="primary" {...props}>{label}</Button>;
}

export function DangerButton({ label, ...props }: ActionButtonProps) {
  return <Button variant="danger" {...props}>{label}</Button>;
}

export function GradientButton({ label, ...props }: ActionButtonProps) {
  return <Button gradient {...props}>{label}</Button>;
}

// Link-styled button
interface LinkButtonProps {
  onClick: () => void;
  children: ReactNode;
  color?: 'purple' | 'blue' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

const linkColors = {
  purple: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
  blue: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  red: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  gray: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20',
};

export function LinkButton({ onClick, children, color = 'purple', size = 'md' }: LinkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${linkColors[color]} ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded-lg transition-all`}
    >
      {children}
    </button>
  );
}
