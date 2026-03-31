'use client';

import ThemeToggle from '../../components/ThemeToggle';
import { NotificationBell } from './NotificationBell';
import UserProfile from './UserProfile';
import { ConnectWallet } from '@/components/wallet';

export function DashboardHeader() {
  return (
    <header className="relative z-50 bg-gradient-to-r from-[rgba(255,255,255,0.92)] to-[rgba(255,255,255,0.65)] dark:from-[rgba(16,18,29,0.75)] dark:to-[rgba(16,18,29,0.08)] border-b border-[var(--color-border)] backdrop-blur-[20px] px-6 py-4">
      <div className="flex items-center justify-end">
        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          <ConnectWallet />
          <NotificationBell />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
