import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage, sendTelegramNotification } from '@/lib/telegram';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

interface SendMessageRequest {
  chatId: number;
  message: string;
  notification?: {
    title: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'JWT_SECRET not configured' },
        { status: 500 }
      );
    }

    // Verify the JWT token
    try {
      jwt.verify(token, jwtSecret);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body: SendMessageRequest = await request.json();
    const { chatId, message, notification } = body;

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId and message are required' },
        { status: 400 }
      );
    }

    // Send message
    let result;
    if (notification?.title) {
      result = await sendTelegramNotification(chatId, notification.title, message);
    } else {
      result = await sendTelegramMessage(chatId, message);
    }

    return NextResponse.json({
      success: true,
      messageId: result.message_id,
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
