/**
 * GET /api/telegram/messages
 * Fetch Telegram messages from MongoDB (mock data for now)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/mongodb';
import type { TelegramMessage } from '@/types/telegram';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId') || 'chocosfera_community';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const before = searchParams.get('before'); // Timestamp for pagination

    // Get messages collection
    const messagesCollection = await getCollection<TelegramMessage>(
      Collections.TELEGRAM_MESSAGES
    );

    // Build query
    const query: Record<string, unknown> = {
      channelId,
      isDeleted: false,
    };

    // Add pagination if before timestamp provided
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // Fetch messages sorted by timestamp (newest first)
    const messages = await messagesCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        ...msg,
        _id: msg._id.toString(), // Convert ObjectId to string
      })),
      count: messages.length,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Error fetching Telegram messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}
