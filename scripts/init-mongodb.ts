/**
 * Initialize MongoDB Indexes
 * Run with: npx tsx scripts/init-mongodb.ts
 */

import { initializeMongoIndexes, getDatabase } from '../lib/mongodb';

async function main() {
  console.log('🔄 Connecting to MongoDB...');

  try {
    const db = await getDatabase();
    console.log('✅ Connected to MongoDB:', db.databaseName);

    console.log('🔄 Creating indexes...');
    await initializeMongoIndexes();

    console.log('✅ MongoDB initialization complete!');
    console.log('\nCollections available:');
    const collections = await db.listCollections().toArray();
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    console.log('\n📊 Database stats:');
    const stats = await db.stats();
    console.log(`  Collections: ${stats.collections}`);
    console.log(`  Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`  Indexes: ${stats.indexes}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error);
    process.exit(1);
  }
}

main();
