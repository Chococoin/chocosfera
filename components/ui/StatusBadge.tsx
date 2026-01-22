type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'purple' | 'pink' | 'blue' | 'green' | 'yellow' | 'orange';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function StatusBadge({ variant, children, icon, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

// Convenience components for common status types
export function ActiveBadge({ label = 'Activo' }: { label?: string }) {
  return <StatusBadge variant="success">{label}</StatusBadge>;
}

export function InactiveBadge({ label = 'Inactivo' }: { label?: string }) {
  return <StatusBadge variant="default">{label}</StatusBadge>;
}

export function PendingBadge({ label = 'Pendiente' }: { label?: string }) {
  return <StatusBadge variant="warning">{label}</StatusBadge>;
}

export function DraftBadge({ label = 'Borrador' }: { label?: string }) {
  return <StatusBadge variant="warning" icon="📝">{label}</StatusBadge>;
}

export function PublishedBadge({ label = 'Publicado' }: { label?: string }) {
  return <StatusBadge variant="success" icon="✅">{label}</StatusBadge>;
}

export function PublicBadge({ label = 'Público' }: { label?: string }) {
  return <StatusBadge variant="info" icon="🌍">{label}</StatusBadge>;
}

export function PrivateBadge({ label = 'Privado' }: { label?: string }) {
  return <StatusBadge variant="default" icon="🔒">{label}</StatusBadge>;
}
