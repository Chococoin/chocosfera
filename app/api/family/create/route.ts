import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserStatus } from '@prisma/client';

/**
 * POST /api/family/create
 * Create a new family profile (adults only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Only adults can create families
    if (user.status !== UserStatus.ADULT_VERIFIED) {
      return NextResponse.json(
        {
          error: 'Solo los adultos verificados pueden crear perfiles familiares',
          requiredStatus: 'ADULT_VERIFIED',
          currentStatus: user.status,
        },
        { status: 403 }
      );
    }

    // Check if user already has a family
    if (user.familyId) {
      return NextResponse.json(
        { error: 'Ya perteneces a una familia' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { familyName } = body;

    if (!familyName || familyName.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre de la familia es requerido' },
        { status: 400 }
      );
    }

    // Create family profile and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create family profile
      const familyProfile = await tx.familyProfile.create({
        data: {
          name: familyName.trim(),
          adminUserId: user.id,
          isPublic: false,
          totalTrees: 0,
          totalCO2Offset: 0,
          totalChocoCoins: 0,
        },
      });

      // Update user's familyId
      await tx.user.update({
        where: { id: user.id },
        data: { familyId: familyProfile.id },
      });

      return familyProfile;
    });

    return NextResponse.json({
      success: true,
      family: {
        id: result.id,
        name: result.name,
        adminUserId: result.adminUserId,
      },
      message: '¡Familia creada exitosamente!',
    });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Error al crear el perfil familiar' },
      { status: 500 }
    );
  }
}
