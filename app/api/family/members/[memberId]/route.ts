import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

/**
 * PATCH /api/family/members/[memberId]
 * Update a family member's parent relationship
 *
 * Body:
 * - parentId: string | null - New parent ID (null to remove parent)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Check if user has a family
    if (!user.familyId) {
      return NextResponse.json(
        { error: 'No perteneces a ninguna familia' },
        { status: 403 }
      );
    }

    const { memberId } = await params;
    const { parentId } = await req.json();

    // Validate parentId if provided
    if (parentId !== null && parentId !== undefined) {
      if (typeof parentId !== 'string') {
        return NextResponse.json(
          { error: 'parentId debe ser un string o null' },
          { status: 400 }
        );
      }

      // Check if parent exists and belongs to the same family
      const parentUser = await prisma.user.findUnique({
        where: { id: parentId },
        select: { id: true, familyId: true },
      });

      if (!parentUser) {
        return NextResponse.json(
          { error: 'El padre seleccionado no existe' },
          { status: 400 }
        );
      }

      if (parentUser.familyId !== user.familyId) {
        return NextResponse.json(
          { error: 'El padre seleccionado no pertenece a tu familia' },
          { status: 400 }
        );
      }

      // Prevent circular relationships
      if (parentId === memberId) {
        return NextResponse.json(
          { error: 'Un miembro no puede ser su propio padre' },
          { status: 400 }
        );
      }

      // TODO: Add more sophisticated cycle detection for multi-level relationships
      // For now, we only check direct cycles
    }

    // Get the member to update
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, familyId: true, nick: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      );
    }

    // Check if member belongs to the same family
    if (member.familyId !== user.familyId) {
      return NextResponse.json(
        { error: 'Este miembro no pertenece a tu familia' },
        { status: 403 }
      );
    }

    // Only family admin can edit relationships
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { id: user.familyId },
      select: { adminUserId: true },
    });

    if (!familyProfile) {
      return NextResponse.json(
        { error: 'Familia no encontrada' },
        { status: 404 }
      );
    }

    // Check if user is admin or has admin role
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.FAMILY_ADMIN;
    const isFamilyCreator = familyProfile.adminUserId === user.id;

    if (!isAdmin && !isFamilyCreator) {
      return NextResponse.json(
        { error: 'Solo el administrador de la familia puede editar relaciones' },
        { status: 403 }
      );
    }

    // Update the member's parent
    await prisma.user.update({
      where: { id: memberId },
      data: { parentId: parentId || null },
    });

    return NextResponse.json({
      success: true,
      message: parentId
        ? `Relación actualizada correctamente`
        : `Padre removido correctamente`,
    });
  } catch (error) {
    console.error('Error updating member relationship:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la relación' },
      { status: 500 }
    );
  }
}
