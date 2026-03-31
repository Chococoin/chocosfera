import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/wallet/verify
 * Checks if the current user has a linked wallet.
 */
export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { walletAddress: true },
    });

    return NextResponse.json({
      success: true,
      hasWallet: !!user?.walletAddress,
      walletAddress: user?.walletAddress || null,
    });
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return NextResponse.json({ error: 'Failed to verify wallet' }, { status: 500 });
  }
}
