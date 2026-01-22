import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${paddingClasses[padding]} ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  icon?: string;
  action?: ReactNode;
}

export function CardHeader({ title, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {action}
    </div>
  );
}

interface GradientCardProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  border?: string;
}

export function GradientCard({
  children,
  gradient = 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
  className = '',
  padding = 'md',
  border = 'border-purple-200 dark:border-purple-800',
}: GradientCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-xl border-2 ${border} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  stats: {
    icon: string;
    value: string | number;
    label: string;
  }[];
  columns?: 2 | 3 | 4 | 5;
}

export function StatsCard({ stats, columns = 3 }: StatsCardProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
          <span className="text-2xl block mb-1">{stat.icon}</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
