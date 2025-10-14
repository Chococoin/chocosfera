'use client';

/**
 * Family Management Page
 * Allows users to:
 * - Create family profiles (adults only)
 * - Invite family members (minors can invite parents)
 * - View family members and their trees
 * - Manage family invitations
 */

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { UserStatus } from '@prisma/client';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Invitation {
  id: string;
  recipientEmail: string;
  status: string;
  sentAt: Date;
  expiresAt: Date;
}

export default function FamilyPage() {
  const { user, isMinor } = useAuth();
  const locale = useLocale();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);

  // Fetch invitations on mount
  useEffect(() => {
    if (user && !user.familyId) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setIsLoadingInvitations(true);
      const response = await fetch('/api/family/invite');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations.map((inv: any) => ({
          ...inv,
          sentAt: new Date(inv.sentAt),
          expiresAt: new Date(inv.expiresAt),
        })));
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const hasFamilyProfile = user?.familyId !== null;
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const familyMembers = hasFamilyProfile ? [
    {
      id: user?.id,
      nick: user?.nick,
      firstName: user?.firstName,
      status: user?.status,
      role: 'creator',
      treesCount: 3,
      avatarUrl: user?.avatarUrl,
    },
  ] : [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: inviteEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la invitación');
      }

      setSuccessMessage(data.message || `¡Invitación enviada a ${inviteEmail}!`);
      setInviteEmail('');

      // Refresh invitations list
      await fetchInvitations();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar la invitación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta invitación?')) {
      return;
    }

    try {
      const response = await fetch(`/api/family/invite/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cancelar la invitación');
      }

      // Refresh invitations list
      await fetchInvitations();
      setSuccessMessage('Invitación cancelada correctamente');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al cancelar la invitación');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>👨‍👩‍👧‍👦</span>
              Mi Familia
            </h1>
            <p className="text-white/90">
              {hasFamilyProfile
                ? 'Gestiona tu perfil familiar y árboles compartidos'
                : 'Crea tu perfil familiar o únete a uno existente'}
            </p>
          </div>
          <div className="hidden md:block text-6xl">🌳</div>
        </div>
      </div>

      {/* No Family Profile - Creation Options */}
      {!hasFamilyProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Create Family (Adults Only) */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 shadow-sm ${
            isMinor
              ? 'border-gray-300 dark:border-gray-700 opacity-60'
              : 'border-purple-300 dark:border-purple-700 hover:shadow-md transition-shadow'
          }`}>
            <div className="text-center mb-4">
              <span className="text-6xl block mb-4">🏠</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Crear Perfil Familiar
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Inicia tu propia familia en la Chocósfera y administra los árboles de todos
              </p>
            </div>

            {isMinor ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ Solo los adultos verificados pueden crear perfiles familiares.
                  <Link
                    href={`/${locale}/dashboard/settings`}
                    className="block mt-2 font-semibold underline"
                  >
                    Verificar mi edad
                  </Link>
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Crear Mi Familia
              </button>
            )}
          </div>

          {/* Option 2: Invite Parent (Minors) / Invite Family Member (Adults) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-300 dark:border-blue-700 p-6 shadow-sm">
            <div className="text-center mb-4">
              <span className="text-6xl block mb-4">
                {isMinor ? '👨‍👦' : '💌'}
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isMinor ? 'Invitar a mi Padre/Madre' : 'Unirme por Invitación'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isMinor
                  ? 'Envía una invitación por email para que tu padre o madre cree el perfil familiar'
                  : 'Si alguien te invitó a su familia, recibirás un email con el enlace'}
              </p>
            </div>

            {isMinor ? (
              <form onSubmit={handleInvite} className="space-y-4">
                {successMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-200 text-center">
                      ✅ {successMessage}
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-800 dark:text-red-200 text-center">
                      ❌ {errorMessage}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de tu Padre/Madre
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="padre@example.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
                </button>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 Tu padre/madre recibirá un email con un enlace para registrarse o unirse a tu perfil familiar.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Revisa tu email para ver si tienes invitaciones pendientes
                </p>
                <Link
                  href={`/${locale}/dashboard/settings`}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Ver mis invitaciones →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Invitations Section */}
      {!hasFamilyProfile && !isLoadingInvitations && pendingInvitations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📨</span>
            Invitaciones Pendientes
          </h2>

          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📧</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {invitation.recipientEmail}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enviada: {invitation.sentAt.toLocaleDateString('es-ES')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Expira: {invitation.expiresAt.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                    Pendiente
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Has Family Profile - Show Family Members */}
      {hasFamilyProfile && (
        <div className="space-y-6">
          {/* Family Overview Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Familia García
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {familyMembers.length} miembro{familyMembers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {familyMembers.reduce((sum, member) => sum + member.treesCount, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Árboles Totales
                </p>
              </div>
            </div>

            {/* Family Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <span className="text-2xl block mb-1">🌳</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {familyMembers.reduce((sum, member) => sum + member.treesCount, 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Árboles</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <span className="text-2xl block mb-1">🌍</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2.5</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tons CO₂</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <span className="text-2xl block mb-1">💧</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">5,200</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Litros</p>
              </div>
            </div>
          </div>

          {/* Family Members List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>👥</span>
                Miembros de la Familia
              </h2>
              {!isMinor && (
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  + Invitar Miembro
                </button>
              )}
            </div>

            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.nick}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        member.nick.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.firstName || member.nick}
                        </p>
                        {member.role === 'creator' && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                            👑 Creador
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{member.nick}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs">
                          {member.status === UserStatus.MINOR && '👶 Menor'}
                          {member.status === UserStatus.ADULT_PENDING && '⏳ Verificación Pendiente'}
                          {member.status === UserStatus.ADULT_VERIFIED && '✅ Adulto Verificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {member.treesCount}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Árbol{member.treesCount !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>💡</span>
          ¿Cómo funcionan los perfiles familiares?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Los menores pueden invitar a sus padres por email</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Solo adultos verificados pueden crear el perfil familiar</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Todos los árboles de la familia se suman en el perfil</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Podéis crear personajes e historias juntos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
