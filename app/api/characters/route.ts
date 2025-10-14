import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { CharacterDocument, CharacterType } from '@/types/mongodb';
import { initializeUserRepo, getUserRepoPath } from '@/lib/git-service';
import { ObjectId } from 'mongodb';

/**
 * POST /api/characters
 * Create a new character
 *
 * Body:
 * - name: string
 * - characterType: 'cacao' | 'chocolate' | 'farmer' | 'other'
 * - description: string
 * - personality?: string
 * - abilities?: string[]
 * - motto?: string
 * - isPublic: boolean
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      characterType,
      description,
      personality,
      abilities,
      motto,
      isPublic = false,
    } = body;

    // Validate required fields
    if (!name || !characterType || !description) {
      return NextResponse.json(
        { error: 'Nombre, tipo y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Validate character type
    const validTypes: CharacterType[] = ['cacao', 'chocolate', 'farmer', 'other'];
    if (!validTypes.includes(characterType)) {
      return NextResponse.json(
        { error: `Tipo de personaje inválido. Debe ser: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists for this user
    const charactersCollection = await getCollection<CharacterDocument>(Collections.CHARACTERS);
    const existingCharacter = await charactersCollection.findOne({
      userId: user.id,
      slug,
    });

    if (existingCharacter) {
      return NextResponse.json(
        { error: 'Ya tienes un personaje con ese nombre' },
        { status: 400 }
      );
    }

    // Initialize user's Git repository
    const gitService = await initializeUserRepo(user.id, user.nick);
    const repoPath = getUserRepoPath(user.id);

    // Create character in Git
    const commitSha = await gitService.createCharacterCommit({
      name,
      slug,
      type: characterType,
      description,
    });

    // Get commit details
    const history = await gitService.getHistory(1);
    const lastCommit = history[0];

    // Create character document in MongoDB
    const characterDoc: Omit<CharacterDocument, '_id'> = {
      userId: user.id,
      name,
      slug,
      characterType,
      description,
      personality: personality || '',
      abilities: abilities || [],
      motto: motto || '',

      // Git info
      gitRepo: `local://${repoPath}`,
      gitPath: `/personajes/${slug}`,
      currentBranch: 'main',
      lastCommitSha: commitSha,
      lastCommitMessage: lastCommit?.message || 'Initial commit',
      lastCommitDate: lastCommit?.date ? new Date(lastCommit.date) : new Date(),
      lastCommitAuthor: lastCommit?.author_name || user.nick,

      // Fork info
      forkedFrom: undefined,
      forkedCharacter: null,
      isFork: false,

      // Ownership
      isSystemCharacter: false,
      isCanonical: false,
      isPublic,

      // Family
      familyId: user.familyId || null,
      organizationId: null,
      sharedWith: [],

      // Assets
      assets: {
        avatar: undefined,
        banner: undefined,
        icon: '🎭',
      },

      // Stats
      stats: {
        viewCount: 0,
        likeCount: 0,
        forkCount: 0,
        prCount: 0,
        commitsCount: 1,
        storiesCount: 1, // Initial story
      },

      // Metadata
      version: '1.0.0',
      license: 'MIT',
      tags: [characterType],

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: isPublic ? new Date() : null,
      deletedAt: null,
    };

    const result = await charactersCollection.insertOne(characterDoc as any);

    return NextResponse.json({
      success: true,
      character: {
        id: result.insertedId.toString(),
        ...characterDoc,
      },
      message: `¡Personaje "${name}" creado exitosamente!`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Error al crear el personaje' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/characters
 * Get user's characters
 *
 * Query params:
 * - includePublic: boolean - Include public characters from other users
 * - familyId: string - Filter by family
 * - limit: number - Limit results (default 50)
 * - skip: number - Skip results for pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includePublic = searchParams.get('includePublic') === 'true';
    const familyId = searchParams.get('familyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build query
    const query: Record<string, unknown> = {
      deletedAt: null,
    };

    if (familyId) {
      // Family characters
      query.familyId = familyId;
    } else if (includePublic) {
      // User's characters OR public characters
      query.$or = [
        { userId: user.id },
        { isPublic: true },
      ];
    } else {
      // Only user's characters
      query.userId = user.id;
    }

    const charactersCollection = await getCollection<CharacterDocument>(Collections.CHARACTERS);

    // Get total count
    const total = await charactersCollection.countDocuments(query);

    // Get characters
    const characters = await charactersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      characters: characters.map(char => ({
        id: char._id.toString(),
        ...char,
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
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Error al obtener los personajes' },
      { status: 500 }
    );
  }
}
