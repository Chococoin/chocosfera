'use client';

/**
 * FamilyTree Component
 * Displays family members in a visual tree hierarchy based on parent-child relationships
 */

import { UserStatus } from '@prisma/client';
import { useTranslations } from 'next-intl';

export interface FamilyMember {
  id: string;
  nick: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  parentId?: string | null;
  treesCount?: number;
  role?: string;
}

interface FamilyTreeProps {
  members: FamilyMember[];
  currentUserId?: string;
  onEditMember?: (memberId: string, memberName: string, currentParentId: string | null) => void;
  isAdmin?: boolean;
}

interface TreeNode {
  member: FamilyMember;
  children: TreeNode[];
  level: number;
}

/**
 * Organize flat members array into tree structure
 */
function buildTree(members: FamilyMember[]): TreeNode[] {
  const memberMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create nodes for all members
  members.forEach(member => {
    memberMap.set(member.id, {
      member,
      children: [],
      level: 0,
    });
  });

  // Build tree structure
  members.forEach(member => {
    const node = memberMap.get(member.id)!;

    if (member.parentId && memberMap.has(member.parentId)) {
      // Has parent - add as child
      const parentNode = memberMap.get(member.parentId)!;
      parentNode.children.push(node);
      node.level = parentNode.level + 1;
    } else {
      // No parent - add as root
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Render a single tree node with its children
 */
function TreeNodeComponent({
  node,
  currentUserId,
  isLast = false,
  parentIsLast = false,
  onEditMember,
  isAdmin = false,
}: {
  node: TreeNode;
  currentUserId?: string;
  isLast?: boolean;
  parentIsLast?: boolean;
  onEditMember?: (memberId: string, memberName: string, currentParentId: string | null) => void;
  isAdmin?: boolean;
}) {
  const t = useTranslations('dashboard.family.members');
  const member = node.member;
  const hasChildren = node.children.length > 0;
  const isCurrentUser = currentUserId === member.id;

  return (
    <div className="relative">
      {/* Current member */}
      <div className="flex items-start gap-3 mb-4">
        {/* Connection lines */}
        {node.level > 0 && (
          <div className="relative flex-shrink-0 w-8 h-full">
            {/* Horizontal line to parent */}
            <div className="absolute top-6 left-0 w-8 h-0.5 bg-purple-300 dark:bg-purple-700"></div>
            {/* Vertical line from parent */}
            {!parentIsLast && (
              <div className="absolute -top-4 left-0 w-0.5 h-10 bg-purple-300 dark:bg-purple-700"></div>
            )}
          </div>
        )}

        {/* Member card */}
        <div
          className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            isCurrentUser
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md'
          }`}
        >
          {/* Avatar */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
              {member.avatarUrl ? (
                <span className="text-2xl">{member.avatarUrl}</span>
              ) : (
                member.nick.substring(0, 2).toUpperCase()
              )}
            </div>
            {isCurrentUser && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </div>

          {/* Member info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {member.firstName || member.nick}
              </p>
              {member.role === 'creator' && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                  👑
                </span>
              )}
              {isCurrentUser && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                  {t('you')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              @{member.nick}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">
                {member.status === UserStatus.MINOR && `🎓 ${t('student')}`}
                {member.status === UserStatus.ADULT_PENDING && `⏳ ${t('verificationPending')}`}
                {member.status === UserStatus.ADULT_VERIFIED && `✅ ${t('adult')}`}
              </span>
              {typeof member.treesCount === 'number' && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {member.treesCount} 🌳
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Edit button (admin only) */}
          {isAdmin && onEditMember && (
            <button
              type="button"
              onClick={() => onEditMember(member.id, member.firstName || member.nick, member.parentId || null)}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
              title={t('editRelationship')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="ml-8 border-l-2 border-purple-200 dark:border-purple-800 pl-0 relative">
          {/* Vertical connecting line */}
          <div className="absolute top-0 left-0 w-0.5 h-full bg-purple-300 dark:bg-purple-700"></div>

          <div className="space-y-2">
            {node.children.map((childNode, index) => (
              <TreeNodeComponent
                key={childNode.member.id}
                node={childNode}
                currentUserId={currentUserId}
                isLast={index === node.children.length - 1}
                parentIsLast={isLast}
                onEditMember={onEditMember}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main FamilyTree component
 */
export default function FamilyTree({ members, currentUserId, onEditMember, isAdmin = false }: FamilyTreeProps) {
  const t = useTranslations('dashboard.family');
  const tMembers = useTranslations('dashboard.family.members');
  const tTree = useTranslations('dashboard.family.tree');

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <span className="text-4xl block mb-2">🌳</span>
        <p className="text-sm">{tMembers('noMembers')}</p>
      </div>
    );
  }

  const tree = buildTree(members);

  return (
    <div className="space-y-6">
      {/* Tree Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tTree('title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {members.length} {members.length !== 1 ? tTree('membersPlural') : tTree('members')}
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-300 dark:bg-purple-700"></div>
            <span>{tTree('relationship')}</span>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        {tree.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">{tTree('noTreeError')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tree.map((rootNode) => (
              <TreeNodeComponent
                key={rootNode.member.id}
                node={rootNode}
                currentUserId={currentUserId}
                isLast={true}
                onEditMember={onEditMember}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>{tTree('legendTitle')}</strong> {tTree('legendDescription')}
          {isAdmin && tTree('legendAdmin')}
        </p>
      </div>
    </div>
  );
}
