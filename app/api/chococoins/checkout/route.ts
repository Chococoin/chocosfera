import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

/**
 * ChocoCoin Packages
 * Prices in cents (EUR)
 */
const CHOCOCOIN_PACKAGES = [
  {
    id: 'starter',
    name: '100 ChocoCoins',
    amount: 500, // €5.00
    coins: 100,
    description: 'Paquete inicial perfecto para empezar',
  },
  {
    id: 'popular',
    name: '500 ChocoCoins',
    amount: 2000, // €20.00
    coins: 500,
    description: 'El más popular - Ahorra €5',
    discount: true,
  },
  {
    id: 'premium',
    name: '1200 ChocoCoins',
    amount: 4000, // €40.00
    coins: 1200,
    description: 'Mejor valor - Ahorra €20',
    discount: true,
  },
  {
    id: 'mega',
    name: '3000 ChocoCoins',
    amount: 9000, // €90.00
    coins: 3000,
    description: 'Pack mega - Ahorra €60',
    discount: true,
  },
];

/**
 * POST /api/chococoins/checkout
 * Create a Stripe checkout session for ChocoCoin purchase
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID es requerido' },
        { status: 400 }
      );
    }

    // Find the package
    const selectedPackage = CHOCOCOIN_PACKAGES.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Paquete no encontrado' },
        { status: 404 }
      );
    }

    // Get the origin for success/cancel URLs
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
              images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=400'], // Chocolate coin image
            },
            unit_amount: selectedPackage.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard/settings?tab=chococoins&success=true&coins=${selectedPackage.coins}`,
      cancel_url: `${origin}/dashboard/settings?tab=chococoins&canceled=true`,
      metadata: {
        userId: user.id,
        packageId: selectedPackage.id,
        coins: selectedPackage.coins.toString(),
        type: 'chococoin_purchase',
      },
    });

    if (!session.url) {
      throw new Error('No se pudo crear la sesión de pago');
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating ChocoCoin checkout:', error);
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chococoins/checkout
 * Get available ChocoCoin packages
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    packages: CHOCOCOIN_PACKAGES,
  });
}
