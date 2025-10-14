import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';

/**
 * GET /api/stories
 * Get stories with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get('isPublic') === 'true';
    const status = searchParams.get('status');
    const characterId = searchParams.get('characterId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await getSessionUser();
    if (!user && !isPublic) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const storiesCollection = await getCollection(Collections.STORIES);
    const charactersCollection = await getCollection(Collections.CHARACTERS);

    // Build query
    const query: any = {
      deletedAt: null,
    };

    if (isPublic) {
      query.isPublic = true;
    }

    if (status) {
      query.status = status;
    }

    if (characterId) {
      query.characterId = characterId;
    }

    if (userId) {
      query.userId = userId;
    }

    // If not requesting public stories, filter by user's access
    if (!isPublic && user) {
      query.$or = [
        { userId: user.id },
        { isPublic: true },
        ...(user.familyId ? [{ familyId: user.familyId }] : []),
      ];
    }

    // Get stories
    const stories = await storiesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get character info for each story
    const storiesWithCharacterInfo = await Promise.all(
      stories.map(async (story) => {
        const character = await charactersCollection.findOne({
          _id: story.characterId,
          deletedAt: null,
        });

        return {
          id: story._id.toString(),
          characterId: story.characterId.toString(),
          characterName: character?.name || 'Unknown',
          characterSlug: character?.slug || '',
          title: story.title,
          slug: story.slug,
          excerpt: story.excerpt,
          status: story.status,
          isPublic: story.isPublic,
          createdAt: story.createdAt.toISOString(),
          userId: story.userId,
          stats: {
            viewCount: story.stats?.viewCount || 0,
            likeCount: story.stats?.likeCount || 0,
            commentCount: story.stats?.commentCount || 0,
          },
        };
      })
    );

    const total = await storiesCollection.countDocuments(query);

    return NextResponse.json({
      success: true,
      stories: storiesWithCharacterInfo,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Error al obtener las historias' },
      { status: 500 }
    );
  }
}
