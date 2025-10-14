import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getCollection, Collections } from '@/lib/mongodb';
import { CharacterDocument } from '@/types/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET /api/characters/[id]
 * Get character details
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

    const user = await getSessionUser();
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

    // Increment view count (if not owner)
    if (!isOwner) {
      await charactersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { 'stats.viewCount': 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      character: {
        id: character._id.toString(),
        ...character,
        _id: undefined,
      },
      permissions: {
        canEdit: isOwner,
        canDelete: isOwner,
        canFork: true,
      },
    });

  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Error al obtener el personaje' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/characters/[id]
 * Update character
 *
 * Body:
 * - name?: string
 * - description?: string
 * - personality?: string
 * - abilities?: string[]
 * - motto?: string
 * - isPublic?: boolean
 * - tags?: string[]
 */
export async function PUT(
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

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
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
        { error: 'No tienes permiso para editar este personaje' },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Allowed fields to update
    const allowedFields = [
      'name',
      'description',
      'personality',
      'abilities',
      'motto',
      'isPublic',
      'tags',
      'assets',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If making public, set publishedAt
    if (body.isPublic === true && !character.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Update in MongoDB
    await charactersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Get updated character
    const updatedCharacter = await charactersCollection.findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,
      character: {
        id: updatedCharacter!._id.toString(),
        ...updatedCharacter,
        _id: undefined,
      },
      message: 'Personaje actualizado exitosamente',
    });

  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el personaje' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/characters/[id]
 * Delete (soft delete) character
 */
export async function DELETE(
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

    const user = await getSessionUser();
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

    // Check ownership
    if (character.userId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este personaje' },
        { status: 403 }
      );
    }

    // Soft delete
    await charactersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          deletedAt: new Date(),
          isPublic: false, // Make private when deleted
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Personaje eliminado exitosamente',
    });

  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el personaje' },
      { status: 500 }
    );
  }
}
