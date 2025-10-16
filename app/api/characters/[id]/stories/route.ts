import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { CharacterDocument, StoryDocument } from '@/types/mongodb';
import { GitService, getUserRepoPath } from '@/lib/git-service';
import { ObjectId } from 'mongodb';

/**
 * POST /api/characters/[id]/stories
 * Create a new story for a character
 *
 * Body:
 * - title: string
 * - content: string
 * - contentType: 'markdown' | 'html' | 'plaintext'
 * - status: 'draft' | 'published'
 * - isPublic: boolean
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

    const body = await req.json();
    const {
      title,
      content,
      contentType = 'markdown',
      status = 'draft',
      isPublic = false,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
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

    // Check ownership
    if (character.userId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para crear historias para este personaje' },
        { status: 403 }
      );
    }

    // Get current story count to determine chapter number
    const storiesCollection = await getCollection<StoryDocument>(Collections.STORIES);
    const currentCount = await storiesCollection.countDocuments({
      characterId: new ObjectId(id),
      deletedAt: null,
    });

    const chapterNumber = currentCount + 1;

    // Create slug from title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create commit in Git
    const repoPath = getUserRepoPath(user.id);
    const gitService = new GitService(repoPath);

    // Format content for markdown file
    const storyContent = `# ${title}

${content}

---

*Capítulo ${chapterNumber} - ${new Date().toLocaleDateString('es-ES')}*
`;

    const commitSha = await gitService.createStoryCommit(
      character.slug,
      chapterNumber,
      slug,
      storyContent
    );

    // Get commit details
    const history = await gitService.getHistory(1);
    const lastCommit = history[0];

    // Create story document in MongoDB
    const storyDoc: Omit<StoryDocument, '_id'> = {
      characterId: new ObjectId(id),
      userId: user.id,
      title,
      slug,
      content,
      contentType,
      excerpt: content.substring(0, 200), // First 200 chars as excerpt

      // Git info
      gitRepo: character.gitRepo,
      gitPath: `/personajes/${character.slug}/historia/${String(chapterNumber).padStart(2, '0')}-${slug}.md`,
      commitSha,
      commitMessage: lastCommit?.message || `Add chapter ${chapterNumber}`,
      commitDate: lastCommit?.date ? new Date(lastCommit.date) : new Date(),

      // Status
      status,
      isPublic,
      isFeatured: false,

      // Family
      familyId: user.familyId || null,
      organizationId: null,

      // Stats
      stats: {
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      },

      // SEO
      keywords: [character.name, character.characterType, 'historia', 'chocósfera'],

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: status === 'published' ? new Date() : null,
      deletedAt: null,
    };

    const result = await storiesCollection.insertOne(storyDoc as StoryDocument);

    // Update character's story count
    await charactersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { 'stats.storiesCount': 1, 'stats.commitsCount': 1 },
        $set: {
          lastCommitSha: commitSha,
          lastCommitMessage: lastCommit?.message || `Add chapter ${chapterNumber}`,
          lastCommitDate: lastCommit?.date ? new Date(lastCommit.date) : new Date(),
          lastCommitAuthor: user.nick,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      story: {
        id: result.insertedId.toString(),
        ...storyDoc,
      },
      message: `¡Historia "${title}" creada exitosamente!`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Error al crear la historia' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/characters/[id]/stories
 * Get all stories for a character
 *
 * Query params:
 * - status: 'draft' | 'published' | 'archived'
 * - limit: number
 * - skip: number
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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const charactersCollection = await getCollection<CharacterDocument>(Collections.CHARACTERS);
    const storiesCollection = await getCollection<StoryDocument>(Collections.STORIES);

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

    // Check permissions
    const isOwner = user && character.userId === user.id;
    const isPublic = character.isPublic;
    const isFamilyMember = user && user.familyId && character.familyId === user.familyId;
    const hasAccess = isOwner || isPublic || isFamilyMember;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver las historias de este personaje' },
        { status: 403 }
      );
    }

    // Build query
    const query: Record<string, unknown> = {
      characterId: new ObjectId(id),
      deletedAt: null,
    };

    // Only show public stories unless owner
    if (!isOwner) {
      query.isPublic = true;
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    // Get total count
    const total = await storiesCollection.countDocuments(query);

    // Get stories
    const stories = await storiesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      stories: stories.map(story => ({
        id: story._id.toString(),
        ...story,
        _id: undefined,
      })),
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
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
