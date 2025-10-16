import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * POST /api/stories/[id]/like
 * Like/Unlike a story
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
        { error: 'ID de historia inválido' },
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

    const storiesCollection = await getCollection(Collections.STORIES);

    // Find story
    const story = (await storiesCollection.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any; // Cast to any to access stats field

    if (!story) {
      return NextResponse.json(
        { error: 'Historia no encontrada' },
        { status: 404 }
      );
    }

    // Check if story is public or user has access
    const isAuthor = story.userId === user.id;
    const isPublic = story.isPublic;
    const isFamilyMember = user.familyId && story.familyId === user.familyId;
    const hasAccess = isAuthor || isPublic || isFamilyMember;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes permiso para dar like a esta historia' },
        { status: 403 }
      );
    }

    // Check if user already liked this story
    const storyLikesCollection = await getCollection(Collections.STORY_LIKES);
    const existingLike = await storyLikesCollection.findOne({
      storyId: new ObjectId(id),
      userId: user.id,
    });

    let isLiked = false;
    let newLikeCount = story.stats?.likeCount || 0;

    if (existingLike) {
      // Unlike - remove like
      await storyLikesCollection.deleteOne({ _id: existingLike._id });
      newLikeCount = Math.max(0, newLikeCount - 1);

      await storiesCollection.updateOne(
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
      await storyLikesCollection.insertOne({
        storyId: new ObjectId(id),
        userId: user.id,
        createdAt: new Date(),
      });

      newLikeCount = newLikeCount + 1;

      await storiesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'stats.likeCount': newLikeCount,
            updatedAt: new Date(),
          },
        }
      );

      isLiked = true;

      // Create notification for story author (if not self-like)
      if (story.userId !== user.id) {
        try {
          const { createStoryLikedNotification } = await import('@/lib/notification-service');

          await createStoryLikedNotification(
            story.userId,
            user.nick,
            story.title,
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
 * GET /api/stories/[id]/like
 * Check if user has liked a story
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
        { error: 'ID de historia inválido' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isLiked: false });
    }

    const storyLikesCollection = await getCollection(Collections.STORY_LIKES);
    const like = await storyLikesCollection.findOne({
      storyId: new ObjectId(id),
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
