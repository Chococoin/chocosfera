import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Logout user by clearing session cookie
 */
export async function POST() {
  try {
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'Error logging out',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
