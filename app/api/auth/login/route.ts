import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  generateToken,
  setSessionCookie,
} from '@/lib/auth';

/**
 * POST /api/auth/login
 * Login user with email/nick and password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usernameOrEmail, password } = body;

    // Validate required fields
    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: usernameOrEmail and password' },
        { status: 400 }
      );
    }

    // Find user by email or nick
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { nick: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = generateToken(user);

    // Set session cookie
    await setSessionCookie(token);

    console.log(`User logged in: ${user.nick} (${user.email}) - Status: ${user.status}`);

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nick: user.nick,
        email: user.email,
        status: user.status,
        role: user.role,
        familyId: user.familyId,
        telegramAccess: user.telegramAccess,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'Error logging in',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
