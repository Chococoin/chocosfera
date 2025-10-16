import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { CharacterDocument } from '@/types/mongodb';
import { ObjectId } from 'mongodb';

/**
 * POST /api/characters/[id]/like
 * Like/Unlike a character
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de personaje inválido' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const charactersCollection = await getCollection<CharacterDocument>(Collections.CHARACTERS);

    // Find character
    const character = await charactersCollection.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Personaje no encontrado' },
        { status: 404 }
      );
    }

    // Check if character is public or user has access
    const isOwner = character.userId === user.id;
    const isPublic = character.isPublic;
    const isFamilyMember = user.familyId && character.familyId === user.familyId;
    const hasAccess = isOwner || isPublic || isFamilyMember;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes permiso para dar like a este personaje' },
        { status: 403 }
      );
    }

    // Check if user already liked this character
    const characterLikesCollection = await getCollection(Collections.CHARACTER_LIKES);
    const existingLike = await characterLikesCollection.findOne({
      characterId: new ObjectId(id),
      userId: user.id,
    });

    let isLiked = false;
    let newLikeCount = character.stats.likeCount;

    if (existingLike) {
      // Unlike - remove like
      await characterLikesCollection.deleteOne({ _id: existingLike._id });
      newLikeCount = Math.max(0, character.stats.likeCount - 1);

      await charactersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'stats.likeCount': newLikeCount,
            updatedAt: new Date(),
          },
        }
      );

      isLiked = false;
    } else {
      // Like - add like
      await characterLikesCollection.insertOne({
        characterId: new ObjectId(id),
        userId: user.id,
        createdAt: new Date(),
      });

      newLikeCount = character.stats.likeCount + 1;

      await charactersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'stats.likeCount': newLikeCount,
            updatedAt: new Date(),
          },
        }
      );

      isLiked = true;

      // Create notification for character owner (if not self-like)
      if (character.userId !== user.id) {
        try {
          const { createCharacterLikedNotification } = await import('@/lib/notification-service');

          await createCharacterLikedNotification(
            character.userId,
            user.nick,
            character.name,
            id,
            user.locale
          );
        } catch (notifError) {
          console.error('Failed to create like notification:', notifError);
          // Don't fail the like if notification fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount: newLikeCount,
      message: isLiked ? 'Like agregado' : 'Like removido',
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Error al procesar el like' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/characters/[id]/like
 * Check if user has liked a character
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de personaje inválido' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isLiked: false });
    }

    const characterLikesCollection = await getCollection(Collections.CHARACTER_LIKES);
    const like = await characterLikesCollection.findOne({
      characterId: new ObjectId(id),
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      isLiked: !!like,
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Error al verificar el like' },
      { status: 500 }
    );
  }
}
