/**
 * POST /api/telegram/reactions
 * Add a reaction to a Telegram message
 *
 * DELETE /api/telegram/reactions
 * Remove a reaction from a Telegram message
 */

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection, Collections } from '@/lib/mongodb';
import type { TelegramMessage, AddReactionInput, RemoveReactionInput } from '@/types/telegram';

/**
 * POST - Add reaction to message
 */
export async function POST(request: NextRequest) {
  try {
    const body: AddReactionInput = await request.json();
    const { messageId, userId, userName, userAvatar, reactionType } = body;

    // Validate input
    if (!messageId || !userId || !userName || !reactionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get messages collection
    const messagesCollection = await getCollection<TelegramMessage>(
      Collections.TELEGRAM_MESSAGES
    );

    // Check if user already reacted with this emoji
    const existingMessage = await messagesCollection.findOne({
      _id: new ObjectId(messageId),
      'reactions.userId': userId,
      'reactions.reactionType': reactionType,
    });

    if (existingMessage) {
      return NextResponse.json(
        { success: false, error: 'Already reacted with this emoji' },
        { status: 400 }
      );
    }

    // Add reaction
    const newReaction = {
      userId,
      userName,
      userAvatar,
      reactionType,
      createdAt: new Date(),
    };

    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $push: { reactions: newReaction },
        $inc: { [`reactionCounts.${reactionType}`]: 1 },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Message not found or reaction failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reaction: newReaction,
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove reaction from message
 */
export async function DELETE(request: NextRequest) {
  try {
    const body: RemoveReactionInput = await request.json();
    const { messageId, userId, reactionType } = body;

    // Validate input
    if (!messageId || !userId || !reactionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get messages collection
    const messagesCollection = await getCollection<TelegramMessage>(
      Collections.TELEGRAM_MESSAGES
    );

    // Remove reaction
    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $pull: {
          reactions: {
            userId,
            reactionType,
          },
        },
        $inc: { [`reactionCounts.${reactionType}`]: -1 },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Message or reaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reaction removed',
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
