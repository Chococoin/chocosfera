/**
 * MongoDB Client
 *
 * Handles: Characters, Stories, Badges, Comments, Likes, Telegram Messages
 * See: /docs/DATABASE-ARCHITECTURE.md
 */

import { MongoClient, Db, Document } from 'mongodb';

const options = {};

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please add MONGODB_URI to .env.local');
  }

  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

const clientPromise = new Proxy({} as Promise<MongoClient>, {
  get(_target, prop) {
    const real = getClientPromise();
    return Reflect.get(real, prop, real);
  },
});

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
export async function getCollection<T extends Document = Document>(collectionName: string) {
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
  TELEGRAM_MESSAGES: 'telegram_messages',
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

  // Telegram messages indexes
  await db.collection(Collections.TELEGRAM_MESSAGES).createIndexes([
    { key: { channelId: 1, timestamp: -1 } }, // Query by channel, sorted by time
    { key: { telegramMsgId: 1 }, unique: true }, // Prevent duplicate messages
    { key: { 'author.telegramId': 1 } }, // Query by author
    { key: { isDeleted: 1 } }, // Filter deleted messages
  ]);

  console.log('MongoDB indexes initialized successfully');
}
