'use client';

/**
 * Dashboard Protected Layout (Client Component)
 * Wraps the dashboard with ProtectedRoute to ensure authentication
 */

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar } from './Sidebar';
import { Onboarding } from '@/components/Onboarding';

interface DashboardProtectedLayoutProps {
  children: ReactNode;
}

export default function DashboardProtectedLayout({ children }: DashboardProtectedLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen" style={{ background: 'var(--color-background)' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ background: 'var(--color-background)' }}>
            {children}
          </main>
        </div>

        {/* Onboarding Tutorial */}
        <Onboarding />
      </div>
    </ProtectedRoute>
  );
}
