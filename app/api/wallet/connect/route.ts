import { NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/wallet/connect
 * Links a wallet address to the authenticated user after signature verification.
 */
export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (sessionUser.status !== 'ADULT_VERIFIED') {
      return NextResponse.json({ error: 'Adult verification required' }, { status: 403 });
    }

    const { walletAddress, signature, message } = await request.json();

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the signature matches the wallet address
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check if wallet is already linked to another user
    const existing = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });

    if (existing && existing.id !== sessionUser.id) {
      return NextResponse.json({ error: 'Wallet already linked to another account' }, { status: 409 });
    }

    // Link wallet to user
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { walletAddress },
    });

    return NextResponse.json({ success: true, walletAddress });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json({ error: 'Failed to connect wallet' }, { status: 500 });
  }
}
