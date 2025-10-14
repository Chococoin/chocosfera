# Database Architecture - Hybrid Approach

## Decision: PostgreSQL + MongoDB (Hybrid)

**Date:** 2025-10-14
**Status:** Active
**Decision Makers:** Development Team

---

## Context

Chocósfera requires a database architecture that can handle:
- **Critical data** with strong consistency (users, authentication, KYC, family relationships)
- **Flexible content** with variable schemas (characters, stories, user-generated content)
- **Financial transactions** (ChocoCoins, Stripe payments)
- **Creative features** (character customization, story publishing)

The team has extensive experience with MongoDB but recognizes the need for ACID transactions in critical business logic.

---

## Decision

We will use a **hybrid database approach**:

### PostgreSQL (Relational) - Critical Data
- User authentication and profiles
- KYC documents and verification
- Family profiles and relationships
- Invitations system
- Subscription management (Stripe)
- Financial transactions (future)

### MongoDB (Document) - Flexible Content
- Character creation and customization
- Stories and narratives
- Story comments and engagement
- Character badges and achievements
- User activity logs
- Analytics data

---

## Rationale

### Why PostgreSQL for Core Data?

1. **ACID Transactions Required**
   - User registration must be atomic
   - Family linking requires referential integrity
   - KYC verification needs strict state management
   - Financial transactions cannot be eventually consistent

2. **Complex Relationships**
   - Family hierarchies (parent → children)
   - Invitation flows (inviter → recipient → acceptance)
   - User roles and permissions
   - Joins between users, families, and KYC documents

3. **Compliance & Auditing**
   - KYC documents require immutable audit trails
   - GDPR requires precise data deletion
   - Financial regulations demand transactional integrity

4. **Strong Schema for Critical Data**
   - User credentials cannot have variable schemas
   - Email uniqueness must be enforced at DB level
   - Foreign key constraints prevent orphaned records

### Why MongoDB for Creative Content?

1. **Schema Flexibility**
   - Character appearance can evolve (new attributes, accessories)
   - Story structure can vary (text, images, embedded media)
   - Badge systems can expand without migrations
   - Experimentation without schema changes

2. **Performance for Reads**
   - Character galleries require fast document retrieval
   - Story browsing benefits from embedded data
   - No joins needed for character + appearance + badges

3. **Developer Experience**
   - Team has extensive MongoDB experience
   - Faster iteration on creative features
   - Natural JSON structure for frontend consumption

4. **Horizontal Scaling**
   - Character/story data can grow significantly
   - MongoDB sharding ready for future scale
   - Read replicas for public galleries

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │   PostgreSQL     │      │     MongoDB      │   │
│  │   (Prisma ORM)   │      │  (Native Driver) │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

PostgreSQL Tables:           MongoDB Collections:
├── users                    ├── characters
├── kyc_documents            ├── stories
├── invitations              ├── story_comments
├── family_profiles          ├── character_badges
└── (future: transactions)   ├── story_likes
                             └── analytics_events
```

---

## Data Model Split

### PostgreSQL Schema

```sql
-- Core identity and authentication
users (
  id, nick, email, passwordHash,
  status, role, familyId,
  telegramAccess, createdAt, updatedAt
)

-- KYC verification
kyc_documents (
  id, userId, type, documentNumber,
  frontImageUrl, backImageUrl, selfieUrl,
  status, reviewedBy, reviewedAt
)

-- Family system
family_profiles (
  id, name, adminUserId,
  coverImageUrl, familyMotto,
  totalTrees, totalCO2Offset,
  isPublic, createdAt
)

-- Invitation system
invitations (
  id, inviterId, recipientEmail,
  type, status, token, expiresAt
)
```

### MongoDB Schema

```javascript
// characters collection
{
  _id: ObjectId,
  userId: String,        // Reference to PostgreSQL users.id
  familyId: String,      // Reference to PostgreSQL family_profiles.id
  name: String,
  type: String,
  appearance: {          // Flexible nested object
    skinTone: String,
    hairStyle: String,
    hairColor: String,
    eyeColor: String,
    outfit: String,
    accessories: [String]
  },
  personality: [String],
  skills: [String],
  favoriteChocolate: String,
  origin: String,
  backstory: String,
  currentMission: String,
  avatarUrl: String,
  fullBodyImageUrl: String,
  level: Number,
  experience: Number,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// stories collection
{
  _id: ObjectId,
  authorId: String,      // Reference to PostgreSQL users.id
  familyId: String,
  title: String,
  content: String,       // Rich text / Markdown
  characterIds: [String], // References to characters._id
  genre: String,
  ageRating: String,
  coverImageUrl: String,
  illustrations: [String],
  views: Number,
  likes: Number,
  status: String,
  isPublic: Boolean,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// character_badges collection
{
  _id: ObjectId,
  characterId: String,   // Reference to characters._id
  badgeId: String,
  name: String,
  description: String,
  iconUrl: String,
  earnedAt: Date
}

// story_comments collection
{
  _id: ObjectId,
  storyId: String,       // Reference to stories._id
  userId: String,        // Reference to PostgreSQL users.id
  userName: String,      // Denormalized for performance
  content: String,
  createdAt: Date
}
```

---

## Cross-Database References

### How to Link Data Between DBs

**Pattern: Store foreign IDs, fetch separately**

```typescript
// Example: Get user's characters
const user = await prisma.user.findUnique({ where: { id } });
const characters = await mongodb.collection('characters')
  .find({ userId: user.id })
  .toArray();

// Example: Get story with author info
const story = await mongodb.collection('stories').findOne({ _id });
const author = await prisma.user.findUnique({
  where: { id: story.authorId }
});

// Example: Family characters with user info
const family = await prisma.familyProfile.findUnique({
  where: { id },
  include: { members: true }
});
const memberIds = family.members.map(m => m.id);
const characters = await mongodb.collection('characters')
  .find({ userId: { $in: memberIds } })
  .toArray();
```

**Key Principle:**
- PostgreSQL IDs (UUIDs/CUIDs) are stored in MongoDB as strings
- MongoDB ObjectIds are stored as strings if needed in PostgreSQL
- No database-level foreign keys between systems
- Application-level consistency checks

---

## Data Consistency Strategy

### 1. Eventual Consistency is OK for Creative Content
- If a user is deleted, their characters can be cleaned up asynchronously
- Story counts can be slightly stale
- Badge awards can be eventually processed

### 2. Strong Consistency for Critical Paths
- User deletion → immediate check of related data
- Family creation → atomic transaction in PostgreSQL
- KYC approval → immediate status update

### 3. Cleanup Jobs
```typescript
// Cron job: Clean orphaned MongoDB data
async function cleanupOrphanedData() {
  // Find MongoDB characters with non-existent users
  const allUserIds = await prisma.user.findMany({ select: { id: true } });
  const validIds = new Set(allUserIds.map(u => u.id));

  const orphanedCharacters = await mongodb.collection('characters')
    .find({ userId: { $nin: Array.from(validIds) } })
    .toArray();

  // Archive or delete
  if (orphanedCharacters.length > 0) {
    await mongodb.collection('characters_archive')
      .insertMany(orphanedCharacters);
    await mongodb.collection('characters')
      .deleteMany({ userId: { $nin: Array.from(validIds) } });
  }
}
```

---

## Connection Management

### PostgreSQL (Prisma)
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### MongoDB
```typescript
// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('chocosfera');
}
```

---

## Migration Strategy

### PostgreSQL Migrations (Prisma)
```bash
# Create migration
npx prisma migrate dev --name add_user_status

# Apply to production
npx prisma migrate deploy
```

### MongoDB Schema Changes
- No formal migrations needed (schemaless)
- Use application-level versioning:

```typescript
interface Character {
  version: number;  // Schema version
  // ... other fields
}

// Migration function
async function migrateCharacterToV2(character: Character) {
  if (character.version === 1) {
    // Add new fields, transform data
    return {
      ...character,
      version: 2,
      newField: 'default-value'
    };
  }
  return character;
}
```

---

## Backup Strategy

### PostgreSQL
- Automated daily backups via hosting provider
- Point-in-time recovery (PITR)
- Export schema: `pg_dump`

### MongoDB
- MongoDB Atlas automated backups (if using Atlas)
- mongodump for manual backups
- Oplog for point-in-time recovery

### Critical: Both DBs must backup simultaneously
```bash
#!/bin/bash
# backup-all.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
pg_dump $DATABASE_URL > backup_postgres_$TIMESTAMP.sql

# Backup MongoDB
mongodump --uri $MONGODB_URI --out backup_mongo_$TIMESTAMP

# Upload to S3
aws s3 cp backup_postgres_$TIMESTAMP.sql s3://backups/
aws s3 cp -r backup_mongo_$TIMESTAMP s3://backups/
```

---

## Performance Considerations

### Indexing Strategy

**PostgreSQL:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_family_admin ON family_profiles(adminUserId);
```

**MongoDB:**
```javascript
db.characters.createIndex({ userId: 1 });
db.characters.createIndex({ familyId: 1 });
db.characters.createIndex({ isPublic: 1, createdAt: -1 });
db.stories.createIndex({ authorId: 1 });
db.stories.createIndex({ isPublic: 1, publishedAt: -1 });
```

### Query Optimization

**Avoid:**
- Fetching all users then querying MongoDB for each (N+1 problem)
- Joining across databases in application code

**Do:**
- Batch queries: fetch all user IDs, then query MongoDB once
- Cache frequently accessed cross-DB data (Redis)
- Denormalize when appropriate (e.g., store userName in story_comments)

---

## Environment Variables

```bash
# PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/chocosfera"

# MongoDB
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/chocosfera"

# Or MongoDB local
MONGODB_URI="mongodb://localhost:27017/chocosfera"
```

---

## Testing Strategy

### Unit Tests
- Mock both databases
- Test business logic independently

### Integration Tests
- Use test databases (separate from dev/prod)
- Test cross-database workflows
- Cleanup test data after each run

```typescript
// tests/setup.ts
import { prisma } from '@/lib/prisma';
import clientPromise from '@/lib/mongodb';

export async function setupTestDatabases() {
  // PostgreSQL test DB
  await prisma.$connect();

  // MongoDB test DB
  const client = await clientPromise;
  const db = client.db('chocosfera_test');

  return { prisma, db };
}

export async function cleanupTestDatabases() {
  await prisma.user.deleteMany({});
  await prisma.familyProfile.deleteMany({});

  const client = await clientPromise;
  const db = client.db('chocosfera_test');
  await db.collection('characters').deleteMany({});
  await db.collection('stories').deleteMany({});
}
```

---

## Monitoring & Observability

### Metrics to Track

1. **Query Performance**
   - PostgreSQL slow query log
   - MongoDB profiler for slow queries

2. **Connection Pool Health**
   - Prisma connection pool metrics
   - MongoDB connection pool stats

3. **Cross-DB Query Patterns**
   - Log when fetching from both DBs in single request
   - Monitor N+1 query patterns

4. **Data Consistency**
   - Count orphaned records daily
   - Alert on foreign key violations (app-level)

---

## Future Considerations

### When to Reevaluate

**Move MORE to MongoDB if:**
- User profiles become more flexible
- Need real-time collaboration features
- Story/character data grows exponentially

**Move MORE to PostgreSQL if:**
- Need complex joins across all data
- Regulatory requirements tighten
- Team loses MongoDB expertise

### Potential Optimizations

1. **Read Replicas**
   - PostgreSQL read replica for reports
   - MongoDB secondaries for public galleries

2. **Caching Layer**
   - Redis for frequently accessed cross-DB data
   - Cache user + character bundles

3. **Search Engine**
   - Elasticsearch for story/character search
   - Sync from both databases

---

## Decision Review

**Review Date:** Every 6 months
**Next Review:** 2025-04-14

**Success Criteria:**
- ✅ Zero data consistency issues in production
- ✅ P95 query latency < 100ms for both DBs
- ✅ Development velocity maintained
- ✅ Team comfortable with both systems

---

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Hybrid Database Patterns](https://www.mongodb.com/blog/post/polyglot-persistence)
- [Microservices Data Patterns](https://microservices.io/patterns/data/database-per-service.html)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-14
**Maintained By:** Development Team
