'use client';

/**
 * User Profile Component
 * Shows user avatar, status, and quick actions
 */

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserStatus } from '@prisma/client';

interface UserProfileProps {
  isCollapsed?: boolean;
}

export default function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getStatusBadge = () => {
    switch (user.status) {
      case UserStatus.MINOR:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            👶 Menor
          </span>
        );
      case UserStatus.ADULT_PENDING:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            ⏳ Verificación Pendiente
          </span>
        );
      case UserStatus.ADULT_VERIFIED:
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            ✅ Adulto Verificado
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.nick.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isCollapsed ? 'justify-center w-full' : 'gap-3'
        }`}
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.nick}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials()
          )}
        </div>

        {/* User Info - Hidden when collapsed */}
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.firstName || user.nick}
                </p>
              </div>
              <div className="mt-0.5">{getStatusBadge()}</div>
            </div>

            {/* Dropdown Icon */}
            <svg
              className={`h-4 w-4 text-gray-600 transition-transform dark:text-gray-400 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* User Info Header */}
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                @{user.nick}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {getStatusBadge()}
                {user.familyId && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    👨‍👩‍👧‍👦 En Familia
                  </span>
                )}
              </div>
            </div>

            {/* Status Info */}
            {user.status === UserStatus.MINOR && (
              <div className="border-b border-gray-200 bg-yellow-50 p-3 dark:border-gray-700 dark:bg-yellow-900/10">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  👶 Como menor, algunas funciones están restringidas.
                  <button
                    onClick={() => {
                      router.push('/dashboard/settings');
                      setIsOpen(false);
                    }}
                    className="ml-1 font-semibold underline"
                  >
                    Verificar edad
                  </button>
                </p>
              </div>
            )}

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  router.push('/dashboard/settings');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Configuración
              </button>

              {user.familyId && (
                <button
                  onClick={() => {
                    router.push('/dashboard/family');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Mi Familia
                </button>
              )}

              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
