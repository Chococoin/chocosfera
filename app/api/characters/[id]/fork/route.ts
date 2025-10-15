import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { CharacterDocument } from '@/types/mongodb';
import { initializeUserRepo } from '@/lib/git-service';
import { ObjectId } from 'mongodb';

/**
 * POST /api/characters/[id]/fork
 * Fork a public character
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

    // Find original character
    const originalCharacter = await charactersCollection.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!originalCharacter) {
      return NextResponse.json(
        { error: 'Personaje no encontrado' },
        { status: 404 }
      );
    }

    // Check if character is public
    if (!originalCharacter.isPublic) {
      return NextResponse.json(
        { error: 'Este personaje no es público y no puede ser forkeado' },
        { status: 403 }
      );
    }

    // Check if user is trying to fork their own character
    if (originalCharacter.userId === user.id) {
      return NextResponse.json(
        { error: 'No puedes forkear tu propio personaje' },
        { status: 400 }
      );
    }

    // Create new slug for the fork
    const baseName = originalCharacter.name;
    const baseSlug = originalCharacter.slug;
    let newSlug = `${baseSlug}-fork`;
    let counter = 1;

    // Check if slug exists and increment
    while (await charactersCollection.findOne({ userId: user.id, slug: newSlug })) {
      newSlug = `${baseSlug}-fork-${counter}`;
      counter++;
    }

    // Initialize user's Git repository
    const gitService = await initializeUserRepo(user.id, user.nick);
    const repoPath = getUserRepoPath(user.id);

    // Create character in Git (copy from original)
    const commitSha = await gitService.createCharacterCommit({
      name: `${baseName} (Fork)`,
      slug: newSlug,
      type: originalCharacter.characterType,
      description: `Fork de ${baseName}. ${originalCharacter.description}`,
    });

    // Get commit details
    const history = await gitService.getHistory(1);
    const lastCommit = history[0];

    // Create forked character document in MongoDB
    const forkedCharacterDoc: Omit<CharacterDocument, '_id'> = {
      userId: user.id,
      name: `${baseName} (Fork)`,
      slug: newSlug,
      characterType: originalCharacter.characterType,
      description: `Fork de ${baseName}. ${originalCharacter.description}`,
      personality: originalCharacter.personality,
      abilities: originalCharacter.abilities || [],
      motto: originalCharacter.motto || '',

      // Git info
      gitRepo: `local://${repoPath}`,
      gitPath: `/personajes/${newSlug}`,
      currentBranch: 'main',
      lastCommitSha: commitSha,
      lastCommitMessage: lastCommit?.message || 'Initial fork commit',
      lastCommitDate: lastCommit?.date ? new Date(lastCommit.date) : new Date(),
      lastCommitAuthor: user.nick,

      // Fork info
      forkedFrom: originalCharacter.gitRepo,
      forkedCharacter: originalCharacter.forkedCharacter || null,
      isFork: true,

      // Ownership
      isSystemCharacter: false,
      isCanonical: false,
      isPublic: false, // Forks start as private

      // Family
      familyId: user.familyId || null,
      organizationId: null,
      sharedWith: [],

      // Assets (copy from original)
      assets: {
        avatar: originalCharacter.assets.avatar,
        banner: originalCharacter.assets.banner,
        icon: originalCharacter.assets.icon,
      },

      // Stats (reset for fork)
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
      license: originalCharacter.license || 'MIT',
      tags: [...(originalCharacter.tags || []), 'fork'],

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      deletedAt: null,
    };

    const result = await charactersCollection.insertOne(forkedCharacterDoc);

    // Update original character's fork count
    await charactersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { 'stats.forkCount': 1 },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      character: {
        id: result.insertedId.toString(),
        ...forkedCharacterDoc,
      },
      message: `¡Personaje "${baseName}" forkeado exitosamente!`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error forking character:', error);
    return NextResponse.json(
      { error: 'Error al forkear el personaje' },
      { status: 500 }
    );
  }
}
