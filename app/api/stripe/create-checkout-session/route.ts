import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPlanById } from '@/lib/pricing-plans';
import { getCurrencyForLocale, type SupportedCurrency } from '@/lib/currency-config';

/**
 * Get Stripe Price IDs from environment
 * These are stored as a JSON object after running npm run stripe:setup
 */
function getStripePriceIds(): Record<string, Record<SupportedCurrency, string>> {
  const priceIdsEnv = process.env.STRIPE_PRICE_IDS;

  if (!priceIdsEnv) {
    console.warn('STRIPE_PRICE_IDS not found in environment');
    return {};
  }

  try {
    return JSON.parse(priceIdsEnv);
  } catch (error) {
    console.error('Error parsing STRIPE_PRICE_IDS:', error);
    return {};
  }
}

/**
 * Detect currency from locale in request
 */
function detectCurrency(req: NextRequest): SupportedCurrency {
  // Try to get locale from request body or headers
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || req.headers.get('accept-language')?.split(',')[0] || 'es';

  return getCurrencyForLocale(locale);
}

/**
 * Get Price ID for a plan and currency
 */
function getPriceId(planId: string, currency: SupportedCurrency): string | null {
  const allPriceIds = getStripePriceIds();
  const planPriceIds = allPriceIds[planId];

  if (!planPriceIds) {
    console.error(`No price IDs found for plan: ${planId}`);
    return null;
  }

  const priceId = planPriceIds[currency];

  if (!priceId) {
    console.error(`No price ID found for plan ${planId} in currency ${currency}`);
    // Fallback to EUR if currency not found
    return planPriceIds.EUR || null;
  }

  return priceId;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, planIds, locale } = body;

    // Detect currency from locale
    const currency = locale ? getCurrencyForLocale(locale) : detectCurrency(req);

    console.log(`Creating checkout session with currency: ${currency}`);

    // Handle single plan
    if (planId) {
      const plan = getPlanById(planId);

      if (!plan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }

      const priceId = getPriceId(planId, currency);

      if (!priceId) {
        return NextResponse.json(
          { error: 'Price ID not configured for this plan' },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'es'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'es'}/pricing`,
        metadata: {
          planId: plan.id,
          currency: currency,
          locale: locale || 'es',
        },
      });

      return NextResponse.json({ sessionId: session.id });
    }

    // Handle multiple plans
    if (planIds && Array.isArray(planIds) && planIds.length > 0) {
      const lineItems = [];

      for (const id of planIds) {
        const plan = getPlanById(id);
        if (!plan) {
          console.warn(`Plan ${id} not found, skipping`);
          continue;
        }

        const priceId = getPriceId(id, currency);
        if (priceId) {
          lineItems.push({
            price: priceId,
            quantity: 1,
          });
        } else {
          console.warn(`Price ID not found for plan ${id} in currency ${currency}, skipping`);
        }
      }

      if (lineItems.length === 0) {
        return NextResponse.json(
          { error: 'No valid plans found' },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'es'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'es'}/pricing`,
        metadata: {
          planIds: planIds.join(','),
          currency: currency,
          locale: locale || 'es',
        },
      });

      return NextResponse.json({ sessionId: session.id });
    }

    return NextResponse.json(
      { error: 'Invalid request: planId or planIds required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
