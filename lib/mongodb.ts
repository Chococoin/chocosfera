/**
 * MongoDB Client
 *
 * Handles: Characters, Stories, Badges, Comments, Likes
 * See: /docs/DATABASE-ARCHITECTURE.md
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the client across hot reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client for each request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get MongoDB database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('chocosfera');
}

/**
 * Get specific collection with type safety
 */
export async function getCollection<T = Record<string, unknown>>(collectionName: string) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

/**
 * Collection names (constants for consistency)
 */
export const Collections = {
  CHARACTERS: 'characters',
  STORIES: 'stories',
  CHARACTER_BADGES: 'character_badges',
  STORY_COMMENTS: 'story_comments',
  STORY_LIKES: 'story_likes',
  CHARACTER_LIKES: 'character_likes',
  ANALYTICS: 'analytics_events',
} as const;

/**
 * Initialize MongoDB indexes
 * Run this once during setup
 */
export async function initializeMongoIndexes() {
  const db = await getDatabase();

  // Characters indexes
  await db.collection(Collections.CHARACTERS).createIndexes([
    { key: { userId: 1 } },
    { key: { familyId: 1 } },
    { key: { isPublic: 1, createdAt: -1 } },
    { key: { name: 'text' } }, // Text search
  ]);

  // Stories indexes
  await db.collection(Collections.STORIES).createIndexes([
    { key: { authorId: 1 } },
    { key: { familyId: 1 } },
    { key: { isPublic: 1, publishedAt: -1 } },
    { key: { status: 1 } },
    { key: { title: 'text', content: 'text' } }, // Text search
  ]);

  // Character badges indexes
  await db.collection(Collections.CHARACTER_BADGES).createIndexes([
    { key: { characterId: 1 } },
    { key: { badgeId: 1 } },
  ]);

  // Story comments indexes
  await db.collection(Collections.STORY_COMMENTS).createIndexes([
    { key: { storyId: 1, createdAt: -1 } },
    { key: { userId: 1 } },
  ]);

  // Story likes indexes
  await db.collection(Collections.STORY_LIKES).createIndexes([
    { key: { storyId: 1 } },
    { key: { userId: 1, storyId: 1 }, unique: true },
  ]);

  // Character likes indexes
  await db.collection(Collections.CHARACTER_LIKES).createIndexes([
    { key: { characterId: 1 } },
    { key: { userId: 1, characterId: 1 }, unique: true },
  ]);

  console.log('MongoDB indexes initialized successfully');
}
