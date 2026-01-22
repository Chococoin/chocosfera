import { ReactNode } from 'react';

type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; darkBg: string; darkBorder: string; darkText: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    darkBg: 'dark:bg-blue-900/20',
    darkBorder: 'dark:border-blue-800',
    darkText: 'dark:text-blue-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    darkBg: 'dark:bg-yellow-900/20',
    darkBorder: 'dark:border-yellow-800',
    darkText: 'dark:text-yellow-200',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    darkBg: 'dark:bg-red-900/20',
    darkBorder: 'dark:border-red-800',
    darkText: 'dark:text-red-200',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    darkBg: 'dark:bg-green-900/20',
    darkBorder: 'dark:border-green-800',
    darkText: 'dark:text-green-200',
  },
};

const defaultIcons: Record<AlertVariant, string> = {
  info: '💡',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

export function Alert({ variant, title, icon, children, className = '' }: AlertProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon ?? defaultIcons[variant];

  return (
    <div
      className={`${styles.bg} ${styles.darkBg} border ${styles.border} ${styles.darkBorder} rounded-lg p-4 ${className}`}
    >
      {title && (
        <h4 className={`font-semibold ${styles.text} ${styles.darkText} mb-2 flex items-center gap-2`}>
          <span>{displayIcon}</span>
          {title}
        </h4>
      )}
      <div className={`text-sm ${styles.text} ${styles.darkText}`}>
        {children}
      </div>
    </div>
  );
}

interface AlertListProps {
  variant: AlertVariant;
  items: string[];
  title?: string;
  icon?: string;
}

export function AlertList({ variant, items, title, icon }: AlertListProps) {
  return (
    <Alert variant={variant} title={title} icon={icon}>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </Alert>
  );
}
