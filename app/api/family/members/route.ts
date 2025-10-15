import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/family/members
 * Get all members of the user's family with parent-child relationships
 */
export async function GET() {
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
      return NextResponse.json({
        success: true,
        members: [],
        message: 'Usuario no pertenece a ninguna familia',
      });
    }

    // Get all family members including parent relationships
    const members = await prisma.user.findMany({
      where: {
        familyId: user.familyId,
      },
      select: {
        id: true,
        nick: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        status: true,
        parentId: true,
        familyId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get family profile to determine creator
    const familyProfile = await prisma.familyProfile.findUnique({
      where: {
        id: user.familyId,
      },
      select: {
        adminUserId: true,
        name: true,
      },
    });

    // Enrich members with additional info
    const enrichedMembers = members.map(member => ({
      ...member,
      role: member.id === familyProfile?.adminUserId ? 'creator' : 'member',
      treesCount: 0, // TODO: Get from MongoDB trees collection
    }));

    return NextResponse.json({
      success: true,
      members: enrichedMembers,
      familyName: familyProfile?.name || 'Mi Familia',
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: 'Error al obtener los miembros de la familia' },
      { status: 500 }
    );
  }
}
