#!/usr/bin/env node

/**
 * Test MongoDB connection
 * Usage: MONGODB_URI="your-connection-string" node scripts/test-mongodb-connection.js
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI environment variable not set');
  console.log('\nUsage:');
  console.log('  MONGODB_URI="mongodb+srv://..." node scripts/test-mongodb-connection.js');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...\n');
console.log('URI:', uri.replace(/:[^:@]+@/, ':***@')); // Hide password

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!\n');

    // Get database name from URI
    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`📦 Database: ${dbName}`);

    // List collections
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('📂 Collections: (empty - this is normal for a new database)');
    } else {
      console.log('📂 Collections:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }

    console.log('\n✨ Connection test successful!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nCommon issues:');
    console.log('  - Check that password is correct (no special characters that need encoding)');
    console.log('  - Verify IP address is whitelisted (0.0.0.0/0 for all)');
    console.log('  - Ensure database user has read/write permissions');
    console.log('  - Check that database name is in the connection string: /dbname?options');
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
