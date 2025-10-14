import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InvitationStatus } from '@prisma/client';

/**
 * DELETE /api/family/invite/[id]
 * Cancel a pending invitation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authenticated user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    // Check if user owns this invitation
    if (invitation.inviterId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para cancelar esta invitación' },
        { status: 403 }
      );
    }

    // Check if invitation can be cancelled (only pending ones)
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar invitaciones pendientes' },
        { status: 400 }
      );
    }

    // Delete invitation
    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Invitación cancelada correctamente',
    });

  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la invitación' },
      { status: 500 }
    );
  }
}
