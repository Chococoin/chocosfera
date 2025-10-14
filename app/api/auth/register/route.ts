import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  generateToken,
  setSessionCookie,
  validatePassword,
  validateEmail,
  validateNick,
} from '@/lib/auth';
import { UserStatus, UserRole } from '@prisma/client';

/**
 * POST /api/auth/register
 * Register a new user
 *
 * By default, all new users are MINOR status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nick, email, password } = body;

    // Validate required fields
    if (!nick || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: nick, email, or password' },
        { status: 400 }
      );
    }

    // Validate nick
    const nickValidation = validateNick(nick);
    if (!nickValidation.isValid) {
      return NextResponse.json({ error: nickValidation.error }, { status: 400 });
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if nick already exists
    const existingNick = await prisma.user.findUnique({
      where: { nick },
    });

    if (existingNick) {
      return NextResponse.json(
        { error: 'Nick already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (default status: MINOR, no Telegram access)
    const user = await prisma.user.create({
      data: {
        nick,
        email,
        passwordHash,
        status: UserStatus.MINOR, // Default
        role: UserRole.USER,
        telegramAccess: false, // Minors cannot access Telegram
        locale: 'es', // Default locale
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    // Set session cookie
    await setSessionCookie(token);

    console.log(`New user registered: ${user.nick} (${user.email}) - Status: MINOR`);

    // Return user data (without password hash)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          nick: user.nick,
          email: user.email,
          status: user.status,
          role: user.role,
          telegramAccess: user.telegramAccess,
          createdAt: user.createdAt,
        },
        message: 'Registration successful. By default, you are registered as a minor. You can verify your age in Settings.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Error creating account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
