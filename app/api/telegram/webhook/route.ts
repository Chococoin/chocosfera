import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (providedSecret !== webhookSecret) {
        return NextResponse.json(
          { error: 'Invalid webhook secret' },
          { status: 401 }
        );
      }
    }

    const update = await request.json();
    const bot = getTelegramBot();

    // Process the update
    await bot.handleUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook info/status
export async function GET() {
  try {
    const bot = getTelegramBot();
    const webhookInfo = await bot.telegram.getWebhookInfo();

    return NextResponse.json({
      status: 'active',
      webhookInfo,
    });
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook info' },
      { status: 500 }
    );
  }
}
