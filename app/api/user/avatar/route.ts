import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/user/avatar
 * Update user's avatar emoji
 */
export async function PATCH(request: Request) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { avatarUrl } = body;

    // Validate avatarUrl
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid avatar emoji' },
        { status: 400 }
      );
    }

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        avatarUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        nick: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    return NextResponse.json(
      {
        error: 'Error updating avatar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
