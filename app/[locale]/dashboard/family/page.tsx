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
import Link from 'next/link';
import { useLocale } from 'next-intl';
import FamilyTree, { FamilyMember } from '../components/FamilyTree';

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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState<string>('Mi Familia');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [inviteMemberEmail, setInviteMemberEmail] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string>('');
  const [editingMemberName, setEditingMemberName] = useState<string>('');
  const [editParentId, setEditParentId] = useState<string>('');
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [isFamilyAdmin, setIsFamilyAdmin] = useState(false);

  // Fetch invitations on mount
  useEffect(() => {
    if (user && !user.familyId) {
      fetchInvitations();
    }
  }, [user]);

  // Fetch family members on mount
  useEffect(() => {
    if (user && user.familyId) {
      fetchFamilyMembers();
    }
  }, [user]);

  // Check if user is family admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !user.familyId) {
        setIsFamilyAdmin(false);
        return;
      }

      try {
        const response = await fetch('/api/family/members');
        if (response.ok) {
          const data = await response.json();
          const currentMember = data.members.find((m: FamilyMember) => m.id === user.id);
          setIsFamilyAdmin(currentMember?.role === 'creator');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsFamilyAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setIsLoadingInvitations(true);
      const response = await fetch('/api/family/invite');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations.map((inv: Invitation) => ({
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

  const fetchFamilyMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await fetch('/api/family/members');
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.members || []);
        setFamilyName(data.familyName || 'Mi Familia');
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const hasFamilyProfile = user?.familyId !== null;
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

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

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCreatingFamily(true);

    try {
      const response = await fetch('/api/family/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName: newFamilyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la familia');
      }

      setSuccessMessage(data.message || '¡Familia creada exitosamente!');
      setShowCreateFamilyModal(false);
      setNewFamilyName('');

      // Reload page to refresh user data and show family view
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al crear la familia');
    } finally {
      setIsCreatingFamily(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsInvitingMember(true);

    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: inviteMemberEmail,
          parentId: selectedParentId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la invitación');
      }

      setSuccessMessage(data.message || `¡Invitación enviada a ${inviteMemberEmail}!`);
      setShowInviteMemberModal(false);
      setInviteMemberEmail('');
      setSelectedParentId('');

      // Refresh invitations list
      await fetchInvitations();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar la invitación');
    } finally {
      setIsInvitingMember(false);
    }
  };

  const handleEditMemberClick = (memberId: string, memberName: string, currentParentId: string | null) => {
    setEditingMemberId(memberId);
    setEditingMemberName(memberName);
    setEditParentId(currentParentId || '');
    setShowEditMemberModal(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleUpdateMemberRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUpdatingMember(true);

    try {
      const response = await fetch(`/api/family/members/${editingMemberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: editParentId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la relación');
      }

      setSuccessMessage(data.message || '¡Relación actualizada correctamente!');
      setShowEditMemberModal(false);
      setEditingMemberId('');
      setEditingMemberName('');
      setEditParentId('');

      // Refresh family members to show updated tree
      await fetchFamilyMembers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al actualizar la relación');
    } finally {
      setIsUpdatingMember(false);
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
                    Pide a tu padre/madre que verifique tu edad
                  </Link>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateFamilyModal(true)}
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
            {isLoadingMembers ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cargando familia...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {familyName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {familyMembers.length} miembro{familyMembers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {familyMembers.reduce((sum, member) => sum + (member.treesCount || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Árboles Totales
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Family Stats */}
            {!isLoadingMembers && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <span className="text-2xl block mb-1">🌳</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {familyMembers.reduce((sum, member) => sum + (member.treesCount || 0), 0)}
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
            )}
          </div>

          {/* Family Tree Visualization */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>👥</span>
                Miembros de la Familia
              </h2>
              {!isMinor && (
                <button
                  type="button"
                  onClick={() => setShowInviteMemberModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  + Invitar Miembro
                </button>
              )}
            </div>

            <FamilyTree
              members={familyMembers}
              currentUserId={user?.id}
              onEditMember={handleEditMemberClick}
              isAdmin={isFamilyAdmin}
            />
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
            <span>Los estudiantes pueden invitar a sus padres por email</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Solo adultos verificados (mayores de 18 años) pueden crear el perfil familiar</span>
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

      {/* Create Family Modal */}
      {showCreateFamilyModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !isCreatingFamily && setShowCreateFamilyModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Crear Perfil Familiar
                  </h2>
                  <button
                    type="button"
                    onClick={() => !isCreatingFamily && setShowCreateFamilyModal(false)}
                    disabled={isCreatingFamily}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <form onSubmit={handleCreateFamily} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ {errorMessage}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de la Familia
                    </label>
                    <input
                      type="text"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      placeholder="Ej: Familia García, Los Rodríguez..."
                      required
                      minLength={2}
                      maxLength={50}
                      disabled={isCreatingFamily}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Este nombre será visible para todos los miembros de tu familia
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-xs text-purple-800 dark:text-purple-200">
                      💡 <strong>Tip:</strong> Serás el administrador de la familia y podrás invitar a otros miembros.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateFamilyModal(false)}
                      disabled={isCreatingFamily}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingFamily || newFamilyName.trim().length < 2}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingFamily ? 'Creando...' : 'Crear Familia'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invite Member Modal */}
      {showInviteMemberModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !isInvitingMember && setShowInviteMemberModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Invitar Miembro
                  </h2>
                  <button
                    type="button"
                    onClick={() => !isInvitingMember && setShowInviteMemberModal(false)}
                    disabled={isInvitingMember}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <form onSubmit={handleInviteMember} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ {errorMessage}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email del Miembro
                    </label>
                    <input
                      type="email"
                      value={inviteMemberEmail}
                      onChange={(e) => setInviteMemberEmail(e.target.value)}
                      placeholder="miembro@example.com"
                      required
                      disabled={isInvitingMember}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Padre/Madre (opcional)
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      disabled={isInvitingMember}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Sin padre asignado</option>
                      {familyMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName || member.nick}
                          {member.role === 'creator' && ' 👑'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Selecciona quién será el padre/madre de este miembro en el árbol familiar
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> El miembro recibirá un email con un enlace para unirse a tu familia.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteMemberModal(false)}
                      disabled={isInvitingMember}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isInvitingMember || inviteMemberEmail.trim().length < 3}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInvitingMember ? 'Enviando...' : 'Enviar Invitación'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !isUpdatingMember && setShowEditMemberModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Editar Relación Familiar
                  </h2>
                  <button
                    type="button"
                    onClick={() => !isUpdatingMember && setShowEditMemberModal(false)}
                    disabled={isUpdatingMember}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <form onSubmit={handleUpdateMemberRelationship} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      <strong>Editando:</strong> {editingMemberName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Padre/Madre
                    </label>
                    <select
                      value={editParentId}
                      onChange={(e) => setEditParentId(e.target.value)}
                      disabled={isUpdatingMember}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Sin padre asignado (raíz del árbol)</option>
                      {familyMembers
                        .filter((member) => member.id !== editingMemberId)
                        .map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.firstName || member.nick}
                            {member.role === 'creator' && ' 👑'}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Selecciona quién será el padre/madre de este miembro en el árbol familiar
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> Los cambios se reflejarán inmediatamente en el árbol familiar.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditMemberModal(false)}
                      disabled={isUpdatingMember}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingMember}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingMember ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
