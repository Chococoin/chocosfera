#!/usr/bin/env node

/**
 * Test PostgreSQL connection
 * Usage: DATABASE_URL="your-connection-string" node scripts/test-postgresql-connection.js
 */

const { PrismaClient } = require('@prisma/client');

const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error('❌ Error: DATABASE_URL environment variable not set');
  console.log('\nUsage:');
  console.log('  DATABASE_URL="postgresql://..." node scripts/test-postgresql-connection.js');
  process.exit(1);
}

console.log('🔌 Testing PostgreSQL connection...\n');
console.log('URI:', uri.replace(/:[^:@]+@/, ':***@')); // Hide password

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: uri
      }
    }
  });

  try {
    // Test connection
    console.log('⏳ Connecting to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Get database info
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('📊 Database Info:');
    console.log('   Version:', result[0].version);

    // List tables
    const tables = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('   (empty - run "prisma db push" to create tables)');
    } else {
      tables.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
    }

    // Count users (if User table exists)
    try {
      const userCount = await prisma.user.count();
      console.log('\n👥 User count:', userCount);

      if (userCount > 0) {
        const recentUsers = await prisma.user.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nick: true,
            email: true,
            status: true,
            createdAt: true
          }
        });

        console.log('\n📝 Recent users:');
        recentUsers.forEach(user => {
          console.log(`   - ${user.nick} (${user.email}) - ${user.status}`);
        });
      }
    } catch (e) {
      console.log('\n⚠️  User table not found. Run "prisma db push" to create schema.');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ PostgreSQL connection test successful!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nCommon issues:');
    console.log('  - Check that password is correct');
    console.log('  - Verify IP address is whitelisted');
    console.log('  - Ensure connection string includes ?sslmode=require (for cloud)');
    console.log('  - Check that database exists');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
