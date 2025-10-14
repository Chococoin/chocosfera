import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { markAllNotificationsAsRead } from '@/lib/notification-service';

/**
 * GET /api/notifications
 * Get user's notifications
 *
 * Query params:
 * - unreadOnly: boolean - Only return unread notifications
 * - limit: number - Limit results (default 50)
 * - skip: number - Skip results for pagination
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build query
    const where: Record<string, unknown> = {
      userId: user.id,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error al obtener las notificaciones' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark all notifications as read
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PATCH(_req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await markAllNotificationsAsRead(user.id);

    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Error al marcar las notificaciones como leídas' },
      { status: 500 }
    );
  }
}
