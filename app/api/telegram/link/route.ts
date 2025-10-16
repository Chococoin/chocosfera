import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telegram/link
 * Links a Telegram account to the user's Chocósfera account
 *
 * MOCK VERSION: Simulates linking without actual Telegram bot
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { telegramUsername } = body;

    if (!telegramUsername) {
      return NextResponse.json(
        { error: 'Telegram username is required' },
        { status: 400 }
      );
    }

    // MOCK: Generate a fake Telegram ID (in real implementation, this comes from Telegram)
    const mockTelegramId = `tg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Update user with Telegram information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        telegramId: mockTelegramId,
        telegramUsername: telegramUsername.replace('@', ''), // Remove @ if present
      },
      select: {
        id: true,
        nick: true,
        email: true,
        status: true,
        role: true,
        familyId: true,
        telegramAccess: true,
        telegramId: true,
        telegramUsername: true,
        avatarUrl: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account linked successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    return NextResponse.json(
      { error: 'Failed to link Telegram account' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/telegram/link
 * Unlinks the Telegram account from the user's account
 */
export async function DELETE() {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Remove Telegram information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        telegramId: null,
        telegramUsername: null,
      },
      select: {
        id: true,
        nick: true,
        email: true,
        status: true,
        role: true,
        familyId: true,
        telegramAccess: true,
        telegramId: true,
        telegramUsername: true,
        avatarUrl: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account unlinked successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error unlinking Telegram account:', error);
    return NextResponse.json(
      { error: 'Failed to unlink Telegram account' },
      { status: 500 }
    );
  }
}
