/**
 * MongoDB TypeScript Types
 *
 * Type definitions for documents stored in MongoDB
 * See: /docs/DATABASE-ARCHITECTURE.md
 */

import { ObjectId } from 'mongodb';

// ============================================
// CHARACTER TYPES
// ============================================

export interface CharacterAppearance {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfit: string;
  accessories: string[];
}

export type CharacterType = 'cacao_warrior' | 'chocolate_fairy' | 'cocoa_guardian' | 'custom';

export interface Character {
  _id?: ObjectId;
  userId: string;              // References PostgreSQL User.id
  familyId?: string;           // References PostgreSQL FamilyProfile.id
  name: string;
  type: CharacterType;
  appearance: CharacterAppearance;
  personality: string[];
  skills: string[];
  favoriteChocolate?: string;
  origin?: string;             // País de origen del cacao
  backstory: string;
  currentMission?: string;
  avatarUrl?: string;
  fullBodyImageUrl?: string;
  model3DUrl?: string;
  level: number;
  experience: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BADGE TYPES
// ============================================

export interface CharacterBadge {
  _id?: ObjectId;
  characterId: string;         // References Character._id
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
}

// Predefined badges
export const PREDEFINED_BADGES: Record<string, Badge> = {
  FIRST_TREE: {
    id: 'first_tree',
    name: 'Primer Árbol',
    description: 'Adoptaste tu primer árbol de cacao',
    iconUrl: '🌱',
  },
  FAMILY_CREATOR: {
    id: 'family_creator',
    name: 'Fundador Familiar',
    description: 'Creaste un perfil familiar',
    iconUrl: '👨‍👩‍👧‍👦',
  },
  CHARACTER_ARTIST: {
    id: 'character_artist',
    name: 'Artista de Personajes',
    description: 'Creaste tu primer personaje',
    iconUrl: '🎨',
  },
  STORYTELLER: {
    id: 'storyteller',
    name: 'Contador de Historias',
    description: 'Publicaste tu primera historia',
    iconUrl: '📖',
  },
  ECO_WARRIOR: {
    id: 'eco_warrior',
    name: 'Guerrero Ecológico',
    description: 'Compensaste 1 tonelada de CO₂',
    iconUrl: '🌍',
  },
  VERIFIED_ADULT: {
    id: 'verified_adult',
    name: 'Adulto Verificado',
    description: 'Completaste la verificación KYC',
    iconUrl: '✅',
  },
};

// ============================================
// STORY TYPES
// ============================================

export type StoryGenre = 'adventure' | 'mystery' | 'comedy' | 'educational';
export type StoryAgeRating = 'all' | '7+' | '12+';
export type StoryStatus = 'draft' | 'published';

export interface Story {
  _id?: ObjectId;
  authorId: string;            // References PostgreSQL User.id
  familyId?: string;           // References PostgreSQL FamilyProfile.id
  title: string;
  content: string;             // Rich text / Markdown
  characterIds: string[];      // References Character._id
  genre: StoryGenre;
  ageRating: StoryAgeRating;
  coverImageUrl?: string;
  illustrations: string[];
  views: number;
  likes: number;
  status: StoryStatus;
  isPublic: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COMMENT & ENGAGEMENT TYPES
// ============================================

export interface StoryComment {
  _id?: ObjectId;
  storyId: string;             // References Story._id
  userId: string;              // References PostgreSQL User.id
  userName: string;            // Denormalized for performance
  userAvatar?: string;         // Denormalized
  content: string;
  createdAt: Date;
}

export interface StoryLike {
  _id?: ObjectId;
  storyId: string;             // References Story._id
  userId: string;              // References PostgreSQL User.id
  createdAt: Date;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export type AnalyticsEventType =
  | 'page_view'
  | 'character_created'
  | 'story_published'
  | 'story_read'
  | 'tree_adopted'
  | 'family_joined';

export interface AnalyticsEvent {
  _id?: ObjectId;
  eventType: AnalyticsEventType;
  userId?: string;             // References PostgreSQL User.id
  metadata: Record<string, unknown>;
  timestamp: Date;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert ObjectId to string for cross-DB references
 */
export function objectIdToString(id: ObjectId | string): string {
  return id instanceof ObjectId ? id.toHexString() : id;
}

/**
 * Convert string to ObjectId
 */
export function stringToObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

/**
 * Validate if string is valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}
