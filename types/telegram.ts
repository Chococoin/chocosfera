/**
 * Telegram Message Types
 * For MongoDB integration with Telegram chat
 */

import { ObjectId } from 'mongodb';

export interface TelegramAuthor {
  telegramId: string;
  name: string;
  username?: string;
  avatar: string; // Emoji avatar
}

export interface TelegramReaction {
  userId: string; // References User.id from PostgreSQL
  userName: string; // Denormalized for performance
  userAvatar?: string;
  reactionType: string; // Emoji: "❤️", "👍", "🔥", "😂", "👏"
  createdAt: Date;
}

export interface ReactionCounts {
  "❤️"?: number;
  "👍"?: number;
  "🔥"?: number;
  "😂"?: number;
  "👏"?: number;
  [key: string]: number | undefined;
}

export interface TelegramMessage {
  _id: ObjectId;
  telegramMsgId: number; // ID del mensaje en Telegram
  channelId: string; // "chocosfera_community"
  author: TelegramAuthor;
  content: string;
  messageType: 'text' | 'photo' | 'video' | 'sticker'; // Extensible
  mediaUrl?: string;
  timestamp: Date; // Timestamp del mensaje original
  reactions: TelegramReaction[];
  reactionCounts: ReactionCounts;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date; // Timestamp de creación en MongoDB
}

/**
 * Input type for creating a new message
 */
export interface CreateTelegramMessageInput {
  telegramMsgId: number;
  channelId: string;
  author: TelegramAuthor;
  content: string;
  messageType?: 'text' | 'photo' | 'video' | 'sticker';
  mediaUrl?: string;
  timestamp: Date;
}

/**
 * Input type for adding a reaction
 */
export interface AddReactionInput {
  messageId: string; // MongoDB _id
  userId: string;
  userName: string;
  userAvatar?: string;
  reactionType: string;
}

/**
 * Input type for removing a reaction
 */
export interface RemoveReactionInput {
  messageId: string; // MongoDB _id
  userId: string;
  reactionType: string;
}

/**
 * Available reaction emojis
 */
export const REACTION_EMOJIS = ['❤️', '👍', '🔥', '😂', '👏'] as const;
export type ReactionEmoji = typeof REACTION_EMOJIS[number];
