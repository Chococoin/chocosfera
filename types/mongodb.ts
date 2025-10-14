/**
 * MongoDB Document Types
 * Schemas for MongoDB collections
 */

import { ObjectId } from 'mongodb';

/**
 * Character Type
 */
export type CharacterType = 'cacao' | 'chocolate' | 'farmer' | 'other';

/**
 * Character Document in MongoDB
 */
export interface CharacterDocument {
  _id: ObjectId;
  userId: string; // PostgreSQL user ID
  name: string;
  slug: string; // URL-friendly name
  characterType: CharacterType;
  description: string;
  personality?: string;
  abilities?: string[];
  motto?: string;

  // Git information
  gitRepo: string; // e.g., "gitea://usuario-juanito/personajes"
  gitPath: string; // e.g., "/personajes/mi-primer-personaje"
  currentBranch: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: Date;
  lastCommitAuthor?: string;

  // Fork information
  forkedFrom?: string; // e.g., "github://chocosfera/historia-oficial"
  forkedCharacter?: 'tony' | 'pipo' | 'kaoka' | null;
  isFork: boolean;

  // Ownership and visibility
  isSystemCharacter: boolean; // true for Tony, Pipo, Kaoka
  isCanonical: boolean; // true if part of official story
  isPublic: boolean;

  // Family and organization
  familyId?: string | null; // PostgreSQL family ID
  organizationId?: string | null; // Gitea organization ID
  sharedWith: string[]; // Array of user IDs with access

  // Assets
  assets: {
    avatar?: string;
    banner?: string;
    icon?: string;
  };

  // Stats
  stats: {
    viewCount: number;
    likeCount: number;
    forkCount: number;
    prCount: number; // Pull requests received
    commitsCount: number;
    storiesCount: number;
  };

  // Metadata
  version: string; // Semantic versioning
  license?: string; // e.g., "MIT"
  tags: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  deletedAt?: Date | null; // Soft delete
}

/**
 * Story Status
 */
export type StoryStatus = 'draft' | 'published' | 'archived';

/**
 * Story Document in MongoDB
 */
export interface StoryDocument {
  _id: ObjectId;
  characterId: ObjectId; // Reference to character
  userId: string; // PostgreSQL user ID
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  contentType: 'markdown' | 'html' | 'plaintext';
  excerpt?: string;
  coverImage?: string;

  // Git information
  gitRepo: string;
  gitPath: string; // e.g., "/personajes/tony-jr/historia/capitulo-1.md"
  commitSha: string;
  commitMessage: string;
  commitDate: Date;

  // Status and visibility
  status: StoryStatus;
  isPublic: boolean;
  isFeatured: boolean; // Highlighted by system

  // Family and organization
  familyId?: string | null;
  organizationId?: string | null;

  // Stats
  stats: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  };

  // SEO
  metaDescription?: string;
  keywords: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
}

/**
 * Character Badge Document
 */
export interface CharacterBadgeDocument {
  _id: ObjectId;
  characterId: ObjectId;
  badgeId: string; // Could be system badge or custom
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'collaboration' | 'contribution' | 'milestone';
  awardedAt: Date;
  awardedBy?: string; // System or user ID
}

/**
 * Story Comment Document
 */
export interface StoryCommentDocument {
  _id: ObjectId;
  storyId: ObjectId;
  userId: string; // PostgreSQL user ID
  content: string;
  parentCommentId?: ObjectId | null; // For nested comments
  isEdited: boolean;
  editedAt?: Date;

  // Moderation
  isApproved: boolean; // For minor users
  isFlagged: boolean;
  moderatorId?: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Story Like Document
 */
export interface StoryLikeDocument {
  _id: ObjectId;
  storyId: ObjectId;
  userId: string; // PostgreSQL user ID
  createdAt: Date;
}

/**
 * Analytics Event Document
 */
export interface AnalyticsEventDocument {
  _id: ObjectId;
  eventType: 'view' | 'like' | 'fork' | 'pr' | 'commit' | 'share';
  resourceType: 'character' | 'story';
  resourceId: ObjectId;
  userId?: string; // Null for anonymous
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Organization Document (Gitea orgs synced to MongoDB)
 */
export interface OrganizationDocument {
  _id: ObjectId;
  giteaOrgId: number;
  orgName: string; // e.g., "familia-garcia"
  displayName: string;
  description: string;
  orgType: 'family' | 'alliance' | 'community';
  visibility: 'public' | 'private';

  // Family reference
  familyId?: string | null; // PostgreSQL family ID

  // Members
  members: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }>;

  // Stats
  stats: {
    memberCount: number;
    repoCount: number;
    characterCount: number;
    storyCount: number;
  };

  // Metadata
  avatar?: string;
  website?: string;
  location?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Collaboration Request (Pull Request tracking)
 */
export interface CollaborationRequestDocument {
  _id: ObjectId;
  sourceCharacterId: ObjectId; // Who is proposing
  targetCharacterId: ObjectId; // Character to update
  sourceUserId: string;
  targetUserId: string;

  // Git information
  gitPrNumber: number; // Gitea PR number
  gitPrUrl: string;
  gitSourceBranch: string;
  gitTargetBranch: string;

  // Content
  title: string;
  description: string;
  changeType: 'story_addition' | 'character_update' | 'collaboration' | 'fix';

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'merged' | 'closed';
  reviewedBy?: string;
  reviewedAt?: Date;
  mergedAt?: Date;

  // Comments
  comments: Array<{
    userId: string;
    content: string;
    createdAt: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper Types
 */
export type CharacterCreateInput = Omit<
  CharacterDocument,
  '_id' | 'createdAt' | 'updatedAt' | 'stats'
> & {
  stats?: Partial<CharacterDocument['stats']>;
};

export type StoryCreateInput = Omit<
  StoryDocument,
  '_id' | 'createdAt' | 'updatedAt' | 'stats'
> & {
  stats?: Partial<StoryDocument['stats']>;
};

export type CharacterUpdateInput = Partial<
  Omit<CharacterDocument, '_id' | 'userId' | 'createdAt'>
>;

export type StoryUpdateInput = Partial<
  Omit<StoryDocument, '_id' | 'userId' | 'characterId' | 'createdAt'>
>;
