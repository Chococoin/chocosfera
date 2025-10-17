#!/usr/bin/env node

/**
 * Generate a secure JWT secret for production
 * Run with: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate a cryptographically secure random string
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 Generated JWT Secret:\n');
console.log(secret);
console.log('\n📋 Add this to your Vercel environment variables:');
console.log(`JWT_SECRET="${secret}"`);
console.log('\n⚠️  IMPORTANT: Never commit this secret to git!\n');
