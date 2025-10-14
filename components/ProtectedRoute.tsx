'use client';

/**
 * Protected Route Component
 * Ensures users are authenticated before accessing protected pages
 * Redirects to login if not authenticated
 */

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdult?: boolean; // If true, requires ADULT_VERIFIED status
  requireTelegramAccess?: boolean; // If true, requires Telegram access
  redirectTo?: string; // Custom redirect path (defaults to /login)
}

export default function ProtectedRoute({
  children,
  requireAdult = false,
  requireTelegramAccess = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isMinor, hasTelegramAccess } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Extract locale from pathname (e.g., /es/dashboard -> es)
    const locale = pathname.split('/')[1] || 'es';

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const loginPath = redirectTo || `/${locale}/login`;
      router.push(loginPath);
      return;
    }

    // Requires adult verification
    if (requireAdult && isMinor) {
      router.push(`/${locale}/dashboard/settings`);
      return;
    }

    // Requires Telegram access
    if (requireTelegramAccess && !hasTelegramAccess) {
      router.push(`/${locale}/dashboard/settings`);
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    isMinor,
    hasTelegramAccess,
    requireAdult,
    requireTelegramAccess,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Check adult requirement
  if (requireAdult && isMinor) {
    return null; // Redirecting to settings
  }

  // Check Telegram access requirement
  if (requireTelegramAccess && !hasTelegramAccess) {
    return null; // Redirecting to settings
  }

  // All checks passed - render children
  return <>{children}</>;
}
