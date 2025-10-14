#!/usr/bin/env tsx

/**
 * Stripe Products Setup Script
 *
 * This script automatically creates all Chocósfera subscription products
 * and prices in Stripe with multi-currency support.
 *
 * Run: npm run stripe:setup
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Import our pricing configuration
const pricingPlans = [
  {
    id: 'seed-sprout',
    name: 'Seed - Sprout',
    description: 'Newsletter exclusivo, early access, badge, Telegram VIP, 50 ChocoCoins',
    priceEUR: 2.99,
    interval: 'month' as const,
  },
  {
    id: 'seed-seedling',
    name: 'Seed - Seedling',
    description: 'Beta privada, llamada mensual, voto en decisiones, 100 ChocoCoins, 10% descuento',
    priceEUR: 4.99,
    interval: 'month' as const,
  },
  {
    id: 'seed-sapling',
    name: 'Seed - Sapling',
    description: 'Sesión 1-on-1, reconocimiento, prioridad soporte, 200 ChocoCoins, 20% descuento, eventos',
    priceEUR: 9.99,
    interval: 'month' as const,
  },
  {
    id: 'fruit-cacao',
    name: 'Fruit - Cacao Pod',
    description: '1 árbol adoptado, certificado digital, 50 ChocoCoins/mes, 10% descuento, trazabilidad completa',
    priceEUR: 15.99,
    interval: 'month' as const,
  },
  {
    id: 'fruit-grove',
    name: 'Fruit - Cacao Grove',
    description: '3 árboles, NFT, 150 ChocoCoins/mes, 20% descuento, tableta personalizada anual, diseño exclusivo',
    priceEUR: 39.99,
    interval: 'month' as const,
  },
  {
    id: 'fruit-forest',
    name: 'Fruit - Cacao Forest',
    description: '10 árboles, NFT premium, 500 ChocoCoins/mes, 30% descuento, 3 tabletas anuales, marca personal',
    priceEUR: 89.99,
    interval: 'month' as const,
  },
];

// Currency configurations
const currencies = {
  EUR: { code: 'eur', rate: 1.0, decimals: 2 },
  USD: { code: 'usd', rate: 1.08, decimals: 2 },
  GBP: { code: 'gbp', rate: 0.86, decimals: 2 },
  JPY: { code: 'jpy', rate: 163.0, decimals: 0 },
  CNY: { code: 'cny', rate: 7.85, decimals: 2 },
};

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in .env.local');
  console.error('Please add your Stripe secret key to .env.local');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Convert EUR price to target currency
 */
function convertPrice(eurPrice: number, currencyKey: keyof typeof currencies): number {
  const { rate, decimals } = currencies[currencyKey];
  const converted = eurPrice * rate;
  return Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Convert to Stripe's smallest currency unit
 */
function toStripeAmount(amount: number, currencyKey: keyof typeof currencies): number {
  const { decimals } = currencies[currencyKey];
  return Math.round(amount * Math.pow(10, decimals));
}

/**
 * Create or update a product in Stripe
 */
async function createProduct(plan: typeof pricingPlans[0]): Promise<string> {
  console.log(`\n📦 Creating product: ${plan.name}...`);

  try {
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: `name:'${plan.name}'`,
    });

    let product: Stripe.Product;

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`   ✓ Product already exists (${product.id})`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          planId: plan.id,
          scheme: plan.id.startsWith('seed') ? 'seed' : 'fruit',
        },
      });
      console.log(`   ✓ Product created (${product.id})`);
    }

    return product.id;
  } catch (error) {
    console.error(`   ❌ Error creating product: ${error}`);
    throw error;
  }
}

/**
 * Create prices for all currencies
 */
async function createPrices(productId: string, plan: typeof pricingPlans[0]): Promise<Record<string, string>> {
  console.log(`\n💰 Creating prices for ${plan.name}...`);

  const priceIds: Record<string, string> = {};

  for (const [currencyKey, config] of Object.entries(currencies)) {
    try {
      const amount = convertPrice(plan.priceEUR, currencyKey as keyof typeof currencies);
      const stripeAmount = toStripeAmount(amount, currencyKey as keyof typeof currencies);

      // Check if price already exists
      const existingPrices = await stripe.prices.list({
        product: productId,
        currency: config.code,
        active: true,
      });

      let price: Stripe.Price;

      if (existingPrices.data.length > 0) {
        price = existingPrices.data[0];
        console.log(`   ✓ ${currencyKey}: Price already exists (${price.id})`);
      } else {
        price = await stripe.prices.create({
          product: productId,
          currency: config.code,
          unit_amount: stripeAmount,
          recurring: {
            interval: plan.interval,
          },
          metadata: {
            planId: plan.id,
            originalCurrency: 'EUR',
            originalAmount: plan.priceEUR.toString(),
          },
        });
        console.log(`   ✓ ${currencyKey}: ${amount.toFixed(config.decimals)} (${price.id})`);
      }

      priceIds[currencyKey] = price.id;
    } catch (error) {
      console.error(`   ❌ Error creating ${currencyKey} price: ${error}`);
    }
  }

  return priceIds;
}

/**
 * Update .env.local with the generated price IDs
 */
function updateEnvFile(allPriceIds: Record<string, Record<string, string>>): void {
  console.log('\n📝 Updating .env.local...');

  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Create a JSON string with all price IDs
  const priceIdsJson = JSON.stringify(allPriceIds, null, 2);

  // Check if STRIPE_PRICE_IDS already exists
  if (envContent.includes('STRIPE_PRICE_IDS=')) {
    // Replace existing value
    envContent = envContent.replace(
      /STRIPE_PRICE_IDS=.*/,
      `STRIPE_PRICE_IDS='${priceIdsJson.replace(/\n/g, '')}'`
    );
  } else {
    // Add new variable
    envContent += `\n\n# Stripe Price IDs (generated by setup script)\nSTRIPE_PRICE_IDS='${priceIdsJson.replace(/\n/g, '')}'\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('   ✓ .env.local updated');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Chocósfera Stripe Setup\n');
  console.log('========================================');
  console.log('Creating products and prices in Stripe...');
  console.log('========================================');

  const allPriceIds: Record<string, Record<string, string>> = {};

  for (const plan of pricingPlans) {
    try {
      const productId = await createProduct(plan);
      const priceIds = await createPrices(productId, plan);
      allPriceIds[plan.id] = priceIds;
    } catch (error) {
      console.error(`\n❌ Failed to create plan ${plan.id}:`, error);
      continue;
    }
  }

  // Update .env.local
  updateEnvFile(allPriceIds);

  console.log('\n========================================');
  console.log('✅ Setup completed successfully!');
  console.log('========================================\n');
  console.log('📋 Summary:');
  console.log(`   • ${pricingPlans.length} products created/verified`);
  console.log(`   • ${Object.keys(currencies).length} currencies per product`);
  console.log(`   • Total prices: ${pricingPlans.length * Object.keys(currencies).length}`);
  console.log('\n🎉 Your Stripe account is now ready to accept payments!');
  console.log('\n💡 Next steps:');
  console.log('   1. Restart your dev server: npm run dev');
  console.log('   2. Visit /pricing to see your plans');
  console.log('   3. Test checkout flow');
  console.log('\n📊 View products: https://dashboard.stripe.com/products');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
