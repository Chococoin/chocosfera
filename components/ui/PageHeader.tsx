import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  gradient?: string;
  decorativeIcon?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  gradient = 'from-purple-600 to-indigo-600',
  decorativeIcon,
  action,
}: PageHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl text-white p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </h1>
          <p className="text-white/90">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          {action}
          {decorativeIcon && (
            <div className="hidden md:block text-6xl">{decorativeIcon}</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface PageHeaderWithBreadcrumbProps extends PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeaderWithBreadcrumb({
  breadcrumbs,
  ...headerProps
}: PageHeaderWithBreadcrumbProps) {
  return (
    <div className="space-y-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>›</span>}
              {item.icon && <span>{item.icon}</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-gray-900 dark:hover:text-white">
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <PageHeader {...headerProps} />
    </div>
  );
}
