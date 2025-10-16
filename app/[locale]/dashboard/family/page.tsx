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
import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations('dashboard.family');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState<string>(t('title'));
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
        setFamilyName(data.familyName || t('title'));
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
        throw new Error(data.error || t('invitations.sendError'));
      }

      setSuccessMessage(data.message || t('inviteParent.successMessage', { email: inviteEmail }));
      setInviteEmail('');

      // Refresh invitations list
      await fetchInvitations();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('invitations.sendError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm(t('invitations.cancelConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/family/invite/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('invitations.cancelError'));
      }

      // Refresh invitations list
      await fetchInvitations();
      setSuccessMessage(t('invitations.cancelSuccess'));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('invitations.cancelError'));
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
        throw new Error(data.error || t('createFamily.errorMessage'));
      }

      setSuccessMessage(data.message || t('createFamily.successMessage'));
      setShowCreateFamilyModal(false);
      setNewFamilyName('');

      // Reload page to refresh user data and show family view
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('createFamily.errorMessage'));
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
        throw new Error(data.error || t('invitations.sendError'));
      }

      setSuccessMessage(data.message || t('inviteMember.successMessage', { email: inviteMemberEmail }));
      setShowInviteMemberModal(false);
      setInviteMemberEmail('');
      setSelectedParentId('');

      // Refresh invitations list
      await fetchInvitations();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('invitations.sendError'));
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
        throw new Error(data.error || t('editMember.errorMessage'));
      }

      setSuccessMessage(data.message || t('editMember.successMessage'));
      setShowEditMemberModal(false);
      setEditingMemberId('');
      setEditingMemberName('');
      setEditParentId('');

      // Refresh family members to show updated tree
      await fetchFamilyMembers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('editMember.errorMessage'));
    } finally {
      setIsUpdatingMember(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted">{t('loading')}</p>
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
              {t('title')}
            </h1>
            <p className="text-white/90">
              {hasFamilyProfile
                ? t('headerWithFamily')
                : t('headerWithoutFamily')}
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
                {t('createFamily.title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('createFamily.description')}
              </p>
            </div>

            {isMinor ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ {t('createFamily.minorWarning')}
                  <Link
                    href={`/${locale}/dashboard/settings`}
                    className="block mt-2 font-semibold underline"
                  >
                    {t('createFamily.verifyAgeLink')}
                  </Link>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateFamilyModal(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                {t('createFamily.button')}
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
                {isMinor ? t('inviteParent.title') : t('joinFamily.title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isMinor
                  ? t('inviteParent.description')
                  : t('joinFamily.description')}
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
                    {t('inviteParent.emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder={t('inviteParent.emailPlaceholder')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('inviteParent.sending') : t('inviteParent.sendButton')}
                </button>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 {t('inviteParent.tipText')}
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('joinFamily.checkEmailText')}
                </p>
                <Link
                  href={`/${locale}/dashboard/settings`}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  {t('joinFamily.viewInvitationsLink')}
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
            {t('invitations.title')}
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
                      {t('invitations.sent')} {invitation.sentAt.toLocaleDateString(locale)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t('invitations.expires')} {invitation.expiresAt.toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                    {t('invitations.pending')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    {t('invitations.cancelButton')}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('loadingFamily')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {familyName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {familyMembers.length} {familyMembers.length !== 1 ? t('overview.membersPlural') : t('overview.members')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {familyMembers.reduce((sum, member) => sum + (member.treesCount || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('overview.totalTrees')}
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
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('overview.trees')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <span className="text-2xl block mb-1">🌍</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">2.5</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('overview.co2')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <span className="text-2xl block mb-1">💧</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">5,200</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('overview.water')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Family Tree Visualization */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>👥</span>
                {t('members.title')}
              </h2>
              {!isMinor && (
                <button
                  type="button"
                  onClick={() => setShowInviteMemberModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  {t('members.inviteButton')}
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
          {t('info.title')}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('info.point1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('info.point2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('info.point3')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>{t('info.point4')}</span>
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
                    {t('createFamily.modalTitle')}
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
                      {t('createFamily.nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      placeholder={t('createFamily.namePlaceholder')}
                      required
                      minLength={2}
                      maxLength={50}
                      disabled={isCreatingFamily}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('createFamily.nameDescription')}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-xs text-purple-800 dark:text-purple-200">
                      💡 <strong>{t('createFamily.tipLabel')}</strong> {t('createFamily.tipText')}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateFamilyModal(false)}
                      disabled={isCreatingFamily}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      {t('createFamily.cancelButton')}
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingFamily || newFamilyName.trim().length < 2}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingFamily ? t('createFamily.creating') : t('createFamily.createButton')}
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
                    {t('inviteMember.modalTitle')}
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
                      {t('inviteMember.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={inviteMemberEmail}
                      onChange={(e) => setInviteMemberEmail(e.target.value)}
                      placeholder={t('inviteMember.emailPlaceholder')}
                      required
                      disabled={isInvitingMember}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('inviteMember.parentLabel')}
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      disabled={isInvitingMember}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">{t('inviteMember.noParent')}</option>
                      {familyMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName || member.nick}
                          {member.role === 'creator' && ' 👑'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('inviteMember.parentDescription')}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 <strong>{t('createFamily.tipLabel')}</strong> {t('inviteMember.tipText')}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteMemberModal(false)}
                      disabled={isInvitingMember}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      {t('inviteMember.cancelButton')}
                    </button>
                    <button
                      type="submit"
                      disabled={isInvitingMember || inviteMemberEmail.trim().length < 3}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInvitingMember ? t('inviteMember.sending') : t('inviteMember.sendButton')}
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
                    {t('editMember.modalTitle')}
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
                      <strong>{t('editMember.editing')}</strong> {editingMemberName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('editMember.parentLabel')}
                    </label>
                    <select
                      value={editParentId}
                      onChange={(e) => setEditParentId(e.target.value)}
                      disabled={isUpdatingMember}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">{t('editMember.noParent')}</option>
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
                      {t('editMember.parentDescription')}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 <strong>{t('createFamily.tipLabel')}</strong> {t('editMember.tipText')}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditMemberModal(false)}
                      disabled={isUpdatingMember}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      {t('editMember.cancelButton')}
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingMember}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingMember ? t('editMember.saving') : t('editMember.saveButton')}
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
