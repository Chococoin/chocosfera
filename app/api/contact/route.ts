import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, consent, locale } = body;

    // Validation
    if (!name || !email || !subject || !message || !consent) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get user agent and IP for spam prevention
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      undefined;

    // Create contact message in PostgreSQL
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        consent,
        locale: locale || 'es',
        userAgent,
        ipAddress,
        status: 'pending',
      },
    });

    // TODO: Send notification email to support team
    // TODO: Send confirmation email to user
    // TODO: Integrate with support ticket system (e.g., Zendesk, Intercom)

    return NextResponse.json({
      success: true,
      messageId: contactMessage.id,
      message: 'Contact message received successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
