'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader, Card, CardHeader, FullPageLoading } from '@/components/ui';
import FamilyTree, { FamilyMember } from '../components/FamilyTree';
import {
  NoFamilyView,
  FamilyOverviewCard,
  PendingInvitations,
  FamilyInfoCard,
  CreateFamilyModal,
  InviteMemberModal,
  EditMemberModal,
  Invitation,
} from './components';

export default function FamilyPage() {
  const { user, isMinor } = useAuth();
  const t = useTranslations('dashboard.family');

  // State for invitations and family
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState<string>(t('title'));
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isFamilyAdmin, setIsFamilyAdmin] = useState(false);

  // Modal states
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

  const hasFamilyProfile = user?.familyId !== null;
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  // Fetch invitations
  useEffect(() => {
    if (user && !user.familyId) {
      fetchInvitations();
    }
  }, [user]);

  // Fetch family members
  useEffect(() => {
    if (user && user.familyId) {
      fetchFamilyMembers();
      checkAdminStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await fetchInvitations();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('invitations.sendError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm(t('invitations.cancelConfirm'))) return;

    try {
      const response = await fetch(`/api/family/invite/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('invitations.cancelError'));
      }

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
        body: JSON.stringify({ parentId: editParentId || null }),
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
      await fetchFamilyMembers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('editMember.errorMessage'));
    } finally {
      setIsUpdatingMember(false);
    }
  };

  if (!user) {
    return <FullPageLoading message={t('loading')} />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={hasFamilyProfile ? t('headerWithFamily') : t('headerWithoutFamily')}
        icon="👨‍👩‍👧‍👦"
        gradient="from-purple-600 to-pink-600"
        decorativeIcon="🌳"
      />

      {/* No Family Profile - Creation Options */}
      {!hasFamilyProfile && (
        <NoFamilyView
          isMinor={isMinor}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          isSubmitting={isSubmitting}
          successMessage={successMessage}
          errorMessage={errorMessage}
          onInvite={handleInvite}
          onOpenCreateModal={() => setShowCreateFamilyModal(true)}
        />
      )}

      {/* Pending Invitations Section */}
      {!hasFamilyProfile && !isLoadingInvitations && (
        <PendingInvitations
          invitations={pendingInvitations}
          onCancel={handleCancelInvitation}
        />
      )}

      {/* Has Family Profile - Show Family Members */}
      {hasFamilyProfile && (
        <div className="space-y-6">
          <FamilyOverviewCard
            familyName={familyName}
            familyMembers={familyMembers}
            isLoading={isLoadingMembers}
          />

          {/* Family Tree Visualization */}
          <Card>
            <CardHeader
              title={t('members.title')}
              icon="👥"
              action={
                !isMinor && (
                  <button
                    type="button"
                    onClick={() => setShowInviteMemberModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    {t('members.inviteButton')}
                  </button>
                )
              }
            />

            <FamilyTree
              members={familyMembers}
              currentUserId={user?.id}
              onEditMember={handleEditMemberClick}
              isAdmin={isFamilyAdmin}
            />
          </Card>
        </div>
      )}

      {/* Information Card */}
      <FamilyInfoCard />

      {/* Modals */}
      <CreateFamilyModal
        isOpen={showCreateFamilyModal}
        onClose={() => setShowCreateFamilyModal(false)}
        familyName={newFamilyName}
        setFamilyName={setNewFamilyName}
        isSubmitting={isCreatingFamily}
        errorMessage={errorMessage}
        onSubmit={handleCreateFamily}
      />

      <InviteMemberModal
        isOpen={showInviteMemberModal}
        onClose={() => setShowInviteMemberModal(false)}
        email={inviteMemberEmail}
        setEmail={setInviteMemberEmail}
        selectedParentId={selectedParentId}
        setSelectedParentId={setSelectedParentId}
        familyMembers={familyMembers}
        isSubmitting={isInvitingMember}
        errorMessage={errorMessage}
        onSubmit={handleInviteMember}
      />

      <EditMemberModal
        isOpen={showEditMemberModal}
        onClose={() => setShowEditMemberModal(false)}
        memberId={editingMemberId}
        memberName={editingMemberName}
        parentId={editParentId}
        setParentId={setEditParentId}
        familyMembers={familyMembers}
        isSubmitting={isUpdatingMember}
        errorMessage={errorMessage}
        onSubmit={handleUpdateMemberRelationship}
      />
    </div>
  );
}
