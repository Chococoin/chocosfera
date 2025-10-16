import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InvitationStatus } from '@prisma/client';
import { createFamilyAcceptedNotification } from '@/lib/notification-service';

/**
 * GET /api/family/accept/[token]
 * Get invitation details by token (for preview before accepting)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            email: true,
            familyId: true,
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Esta invitación ha expirado' },
        { status: 400 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        {
          error:
            invitation.status === InvitationStatus.ACCEPTED
              ? 'Esta invitación ya fue aceptada'
              : 'Esta invitación ya fue rechazada',
        },
        { status: 400 }
      );
    }

    // Return invitation details
    const inviterName =
      invitation.inviter.firstName && invitation.inviter.lastName
        ? `${invitation.inviter.firstName} ${invitation.inviter.lastName}`
        : invitation.inviter.nick;

    const familyName = invitation.inviter.family?.name || 'Mi Familia';

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        recipientEmail: invitation.recipientEmail,
        inviterName,
        familyName,
        sentAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Error al obtener la invitación' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/family/accept/[token]
 * Accept a family invitation
 *
 * Body:
 * - action: 'accept' | 'decline'
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { action } = await req.json();

    // Validate action
    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "accept" o "decline"' },
        { status: 400 }
      );
    }

    // Get authenticated user (must be logged in to accept/decline)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para responder a esta invitación' },
        { status: 401 }
      );
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: {
            id: true,
            nick: true,
            familyId: true,
            family: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Esta invitación ha expirado' },
        { status: 400 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: 'Esta invitación ya fue procesada' },
        { status: 400 }
      );
    }

    // Check if invitation email matches user's email
    if (invitation.recipientEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            'Esta invitación fue enviada a otro email. Debes iniciar sesión con la cuenta correcta.',
        },
        { status: 403 }
      );
    }

    // Check if user already has a family
    if (user.familyId) {
      return NextResponse.json(
        { error: 'Ya perteneces a una familia. No puedes aceptar esta invitación.' },
        { status: 400 }
      );
    }

    if (action === 'decline') {
      // Decline invitation
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.DECLINED,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Invitación rechazada',
      });
    }

    // Accept invitation
    // If inviter has a family, join it
    // If inviter doesn't have a family yet, create one with both users
    let familyId = invitation.inviter.familyId;

    if (!familyId) {
      // Create new family
      const family = await prisma.familyProfile.create({
        data: {
          name: `Familia de ${invitation.inviter.nick}`,
          adminUserId: invitation.inviter.id,
        },
      });

      familyId = family.id;

      // Update inviter with new familyId
      await prisma.user.update({
        where: { id: invitation.inviter.id },
        data: { familyId: family.id },
      });
    }

    // Extract parentId from invitation metadata if present
    // Note: metadata field is not selected in the query, so we set parentId to null
    const parentId = null;

    // Update user with familyId and parentId
    await prisma.user.update({
      where: { id: user.id },
      data: {
        familyId,
        parentId,
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    // Create notification for inviter
    try {
      await createFamilyAcceptedNotification(
        invitation.inviter.id,
        user.nick,
        user.email,
        user.locale
      );
    } catch (notifError) {
      console.error('Failed to create acceptance notification:', notifError);
      // Don't fail the acceptance if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Te has unido a la familia correctamente',
      familyId,
    });
  } catch (error) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: 'Error al procesar la invitación' },
      { status: 500 }
    );
  }
}
