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
import { sendWelcomeEmail } from '@/lib/email-service';

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

    // Create welcome notifications (2 notifications)
    // Notification 1: ChocoCrypto
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: '¡El primer lote de ChocoCrypto está listo!', // Will be translated in frontend
        message: 'Usa tus ChocoCoins para conseguir deliciosas tabletas de chocolate. ¡Descubre más sobre esta novedad!',
        actionUrl: `/${user.locale}/blog`,
        icon: '🍫',
        isRead: false,
      },
    });

    // Notification 2: Venezuela Container
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: '¡Container de Venezuela llegó a Italia!', // Will be translated in frontend
        message: 'Los cacaocultores venezolanos han enviado su primer container de cacao fino a Italia. Conoce esta increíble historia.',
        actionUrl: `/${user.locale}/blog/venezuela-container`,
        icon: '🚢',
        isRead: false,
      },
    });

    // Send welcome email (async, don't wait for it)
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${user.locale}/dashboard`;
    sendWelcomeEmail({
      to: user.email,
      name: user.nick,
      dashboardUrl,
      locale: user.locale,
    }).catch((error) => {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if email fails
    });

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
