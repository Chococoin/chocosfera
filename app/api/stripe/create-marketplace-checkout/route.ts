import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrencyForLocale, toStripeAmount, type SupportedCurrency } from '@/lib/currency-config';

/**
 * Create Stripe Checkout Session for Marketplace Products
 * One-time payment (not subscription)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, productType, priceEUR, locale, userEmail, userName } = body;

    // Validate required fields
    if (!productId || !productName || !priceEUR) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, productName, or priceEUR' },
        { status: 400 }
      );
    }

    // Detect currency from locale
    const currency: SupportedCurrency = locale ? getCurrencyForLocale(locale) : 'EUR';
    console.log(`Creating marketplace checkout with currency: ${currency} for product: ${productName}`);

    // Convert EUR price to user's currency
    // For now, we'll use EUR as base. In production, you'd convert to user's currency
    const amount = toStripeAmount(priceEUR, 'EUR');

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment (not subscription)
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur', // Use EUR for now
            product_data: {
              name: productName,
              description: `Producto del Marketplace de Chocósfera: ${productName}`,
              metadata: {
                productId,
                productType: productType || 'unknown',
              },
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      // Pre-fill customer email from authenticated user
      customer_email: userEmail || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'es'}/dashboard/marketplace?success=true&product=${encodeURIComponent(productName)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'es'}/dashboard/marketplace`,
      metadata: {
        productId,
        productName,
        productType: productType || 'unknown',
        priceEUR: priceEUR.toString(),
        locale: locale || 'es',
        userEmail: userEmail || 'unknown',
        userName: userName || 'unknown',
      },
    });

    console.log(`Checkout session created: ${session.id} for ${productName}`);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating marketplace checkout session:', error);
    return NextResponse.json(
      {
        error: 'Error creating checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
