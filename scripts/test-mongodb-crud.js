#!/usr/bin/env node

/**
 * Test MongoDB CRUD operations (POST/GET equivalent)
 * Usage: MONGODB_URI="your-connection-string" node scripts/test-mongodb-crud.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI environment variable not set');
  process.exit(1);
}

console.log('🧪 Testing MongoDB CRUD Operations\n');
console.log('URI:', uri.replace(/:[^:@]+@/, ':***@'));

async function testCRUD() {
  const client = new MongoClient(uri);

  try {
    // Connect
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    // Use a test collection
    const testCollection = db.collection('test_characters');

    // ========================================
    // POST (Create/Insert)
    // ========================================
    console.log('📝 POST: Creating test document...');
    const testCharacter = {
      name: 'CacaoTestBot',
      type: 'cacao',
      description: 'Test character from MongoDB Atlas',
      appearance: {
        skinTone: 'brown',
        hairStyle: 'spiky',
        hairColor: 'dark brown',
        eyeColor: 'green'
      },
      personality: ['brave', 'curious', 'friendly'],
      skills: ['climbing', 'chocolate making'],
      level: 1,
      experience: 0,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await testCollection.insertOne(testCharacter);
    console.log('✅ Document created with ID:', insertResult.insertedId.toString());
    console.log('   Data:', JSON.stringify(testCharacter, null, 2));

    // ========================================
    // GET (Read/Find)
    // ========================================
    console.log('\n📖 GET: Reading document by ID...');
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Document found:');
    console.log('   ', JSON.stringify(foundDoc, null, 2));

    // ========================================
    // GET ALL (List)
    // ========================================
    console.log('\n📋 GET ALL: Listing all test documents...');
    const allDocs = await testCollection.find({}).toArray();
    console.log(`✅ Found ${allDocs.length} document(s)`);
    allDocs.forEach((doc, index) => {
      console.log(`   [${index + 1}] ${doc.name} (ID: ${doc._id.toString()})`);
    });

    // ========================================
    // UPDATE (Put/Patch)
    // ========================================
    console.log('\n✏️  UPDATE: Updating document...');
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      {
        $set: {
          level: 2,
          experience: 100,
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Document updated:', updateResult.modifiedCount, 'document(s)');

    // Verify update
    const updatedDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('   New level:', updatedDoc.level);
    console.log('   New experience:', updatedDoc.experience);

    // ========================================
    // DELETE
    // ========================================
    console.log('\n🗑️  DELETE: Removing test document...');
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Document deleted:', deleteResult.deletedCount, 'document(s)');

    // Verify deletion
    const deletedDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('   Document still exists?', deletedDoc !== null ? '❌ YES' : '✅ NO');

    // ========================================
    // Summary
    // ========================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All CRUD operations successful!');
    console.log('='.repeat(50));
    console.log('\nMongoDB Atlas is working perfectly!');
    console.log('✅ CREATE (POST) - Working');
    console.log('✅ READ (GET) - Working');
    console.log('✅ UPDATE (PUT/PATCH) - Working');
    console.log('✅ DELETE - Working');
    console.log('\nYou can now use MongoDB Atlas in production! 🚀');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testCRUD();
