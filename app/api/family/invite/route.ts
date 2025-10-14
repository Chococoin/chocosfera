import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InvitationStatus } from '@prisma/client';
import crypto from 'crypto';
import { sendFamilyInvitationEmail } from '@/lib/email-service';

/**
 * POST /api/family/invite
 * Send family invitation
 *
 * Body:
 * - recipientEmail: string - Email del destinatario
 *
 * Returns:
 * - success: boolean
 * - invitation: Invitation object
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

    const { recipientEmail } = await req.json();

    // Validate email
    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return NextResponse.json(
        { error: 'Email del destinatario es requerido' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Check if user is trying to invite themselves
    if (recipientEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'No puedes invitarte a ti mismo' },
        { status: 400 }
      );
    }

    // Check if recipient is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: recipientEmail },
    });

    if (existingUser) {
      // If user already exists and has a family
      if (existingUser.familyId) {
        return NextResponse.json(
          { error: 'Este usuario ya pertenece a una familia' },
          { status: 400 }
        );
      }

      // If user already exists but no family, we can still send invitation
      // They can accept it to join the inviter's future family
    }

    // Check for existing pending invitation to this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        inviterId: user.id,
        recipientEmail: recipientEmail.toLowerCase(),
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Ya existe una invitación pendiente para este email' },
        { status: 400 }
      );
    }

    // Generate unique invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        inviterId: user.id,
        recipientEmail: recipientEmail.toLowerCase(),
        token,
        expiresAt,
        status: InvitationStatus.PENDING,
      },
      include: {
        inviter: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send invitation email (async, don't block the response)
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${user.locale}/family/accept/${token}`;
    const inviterName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.nick;

    // Determine family name
    let familyName = 'Mi Familia';
    if (user.familyId) {
      try {
        const family = await prisma.family.findUnique({
          where: { id: user.familyId },
          select: { name: true },
        });
        if (family) {
          familyName = family.name;
        }
      } catch (error) {
        console.error('Error fetching family name:', error);
      }
    }

    sendFamilyInvitationEmail({
      to: recipientEmail,
      inviterName,
      familyName,
      acceptUrl: inviteLink,
      locale: user.locale,
    }).catch((error) => {
      console.error('Failed to send family invitation email:', error);
      // Don't fail the API call if email fails
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        recipientEmail: invitation.recipientEmail,
        status: invitation.status,
        sentAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
      message: `Invitación enviada a ${recipientEmail}. El destinatario recibirá un email con el enlace para unirse.`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending family invitation:', error);
    return NextResponse.json(
      { error: 'Error al enviar la invitación' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/family/invite
 * Get user's sent invitations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get all invitations sent by this user
    const invitations = await prisma.invitation.findMany({
      where: {
        inviterId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        recipientEmail: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        acceptedAt: true,
        declinedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      invitations: invitations.map(inv => ({
        id: inv.id,
        recipientEmail: inv.recipientEmail,
        status: inv.status,
        sentAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        declinedAt: inv.declinedAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Error al obtener las invitaciones' },
      { status: 500 }
    );
  }
}
