import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { CharacterDocument } from '@/types/mongodb';
import { GitService, getUserRepoPath } from '@/lib/git-service';
import { ObjectId } from 'mongodb';

/**
 * GET /api/characters/[id]/history
 * Get commit history for a character
 *
 * Query params:
 * - limit: number - Number of commits to return (default 50)
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
    const charactersCollection = await getCollection<CharacterDocument>(Collections.CHARACTERS);

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
        { error: 'No tienes permiso para ver este personaje' },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get Git history
    const repoPath = getUserRepoPath(character.userId);
    const gitService = new GitService(repoPath);

    try {
      const history = await gitService.getHistory(limit);

      // Transform history for frontend
      const commits = history.map((commit) => ({
        sha: commit.hash,
        message: commit.message,
        author: commit.author_name,
        email: commit.author_email,
        date: commit.date,
        diff: commit.diff,
      }));

      return NextResponse.json({
        success: true,
        history: commits,
        meta: {
          characterId: id,
          characterSlug: character.slug,
          totalCommits: character.stats.commitsCount,
          firstCommit: commits[commits.length - 1] || null,
          latestCommit: commits[0] || null,
        },
      });

    } catch (gitError) {
      console.error('Error getting Git history:', gitError);
      // Return empty history if Git fails (repo might not exist yet)
      return NextResponse.json({
        success: true,
        history: [],
        meta: {
          characterId: id,
          characterSlug: character.slug,
          totalCommits: 0,
          firstCommit: null,
          latestCommit: null,
        },
        warning: 'No se pudo obtener el historial de Git',
      });
    }

  } catch (error) {
    console.error('Error fetching character history:', error);
    return NextResponse.json(
      { error: 'Error al obtener el historial del personaje' },
      { status: 500 }
    );
  }
}
