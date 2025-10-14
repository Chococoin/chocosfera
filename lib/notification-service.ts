/**
 * Notification Service
 * Helper functions for creating and managing notifications
 */

import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        icon: params.icon,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        expiresAt: params.expiresAt,
      },
    });

    console.log(`[NotificationService] Created notification for user ${params.userId}: ${params.title}`);
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    throw error;
  }
}

/**
 * Create a family invitation notification
 */
export async function createFamilyInvitationNotification(
  recipientUserId: string,
  inviterName: string,
  familyName: string,
  token: string,
  locale: string = 'es'
) {
  const messages = {
    es: `${inviterName} te ha invitado a unirte a la familia "${familyName}"`,
    en: `${inviterName} has invited you to join the "${familyName}" family`,
    it: `${inviterName} ti ha invitato a unirti alla famiglia "${familyName}"`,
  };

  const titles = {
    es: 'Nueva invitación familiar',
    en: 'New family invitation',
    it: 'Nuovo invito familiare',
  };

  return createNotification({
    userId: recipientUserId,
    type: 'FAMILY_INVITATION',
    title: titles[locale as keyof typeof titles] || titles.es,
    message: messages[locale as keyof typeof messages] || messages.es,
    actionUrl: `/${locale}/family/accept/${token}`,
    icon: '👨‍👩‍👧‍👦',
    metadata: {
      inviterName,
      familyName,
      token,
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
}

/**
 * Create a family accepted notification
 */
export async function createFamilyAcceptedNotification(
  inviterUserId: string,
  acceptorName: string,
  acceptorEmail: string,
  locale: string = 'es'
) {
  const messages = {
    es: `${acceptorName} (${acceptorEmail}) ha aceptado tu invitación familiar`,
    en: `${acceptorName} (${acceptorEmail}) has accepted your family invitation`,
    it: `${acceptorName} (${acceptorEmail}) ha accettato il tuo invito familiare`,
  };

  const titles = {
    es: 'Invitación aceptada',
    en: 'Invitation accepted',
    it: 'Invito accettato',
  };

  return createNotification({
    userId: inviterUserId,
    type: 'FAMILY_ACCEPTED',
    title: titles[locale as keyof typeof titles] || titles.es,
    message: messages[locale as keyof typeof messages] || messages.es,
    actionUrl: `/${locale}/dashboard/family`,
    icon: '🎉',
    metadata: {
      acceptorName,
      acceptorEmail,
    },
  });
}

/**
 * Create a story published notification
 */
export async function createStoryPublishedNotification(
  authorUserId: string,
  storyTitle: string,
  characterName: string,
  storyId: string,
  locale: string = 'es'
) {
  const messages = {
    es: `Tu historia "${storyTitle}" para ${characterName} ha sido publicada`,
    en: `Your story "${storyTitle}" for ${characterName} has been published`,
    it: `La tua storia "${storyTitle}" per ${characterName} è stata pubblicata`,
  };

  const titles = {
    es: 'Historia publicada',
    en: 'Story published',
    it: 'Storia pubblicata',
  };

  return createNotification({
    userId: authorUserId,
    type: 'STORY_PUBLISHED',
    title: titles[locale as keyof typeof titles] || titles.es,
    message: messages[locale as keyof typeof messages] || messages.es,
    icon: '📚',
    metadata: {
      storyTitle,
      characterName,
      storyId,
    },
  });
}

/**
 * Create a story liked notification
 */
export async function createStoryLikedNotification(
  authorUserId: string,
  likerName: string,
  storyTitle: string,
  storyId: string,
  locale: string = 'es'
) {
  const messages = {
    es: `A ${likerName} le ha gustado tu historia "${storyTitle}"`,
    en: `${likerName} liked your story "${storyTitle}"`,
    it: `A ${likerName} è piaciuta la tua storia "${storyTitle}"`,
  };

  const titles = {
    es: 'Nueva reacción',
    en: 'New reaction',
    it: 'Nuova reazione',
  };

  return createNotification({
    userId: authorUserId,
    type: 'STORY_LIKED',
    title: titles[locale as keyof typeof titles] || titles.es,
    message: messages[locale as keyof typeof messages] || messages.es,
    icon: '❤️',
    metadata: {
      likerName,
      storyTitle,
      storyId,
    },
  });
}

/**
 * Create a character liked notification
 */
export async function createCharacterLikedNotification(
  authorUserId: string,
  likerName: string,
  characterName: string,
  characterId: string,
  locale: string = 'es'
) {
  const messages = {
    es: `A ${likerName} le ha gustado tu personaje "${characterName}"`,
    en: `${likerName} liked your character "${characterName}"`,
    it: `A ${likerName} è piaciuto il tuo personaggio "${characterName}"`,
  };

  const titles = {
    es: 'Nueva reacción',
    en: 'New reaction',
    it: 'Nuova reazione',
  };

  return createNotification({
    userId: authorUserId,
    type: 'CHARACTER_FORKED', // Using CHARACTER_FORKED type as it's already in Prisma schema
    title: titles[locale as keyof typeof titles] || titles.es,
    message: messages[locale as keyof typeof messages] || messages.es,
    icon: '❤️',
    metadata: {
      likerName,
      characterName,
      characterId,
    },
  });
}

/**
 * Create a system announcement notification
 */
export async function createSystemAnnouncementNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: 'SYSTEM_ANNOUNCEMENT',
    title,
    message,
    actionUrl,
    icon: '📢',
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    console.log(`[NotificationService] Marked ${result.count} notifications as read for user ${userId}`);
    return result;
  } catch (error) {
    console.error('[NotificationService] Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  try {
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
    });

    console.log(`[NotificationService] Deleted notification ${notificationId}`);
  } catch (error) {
    console.error('[NotificationService] Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete expired notifications (cleanup job)
 */
export async function deleteExpiredNotifications() {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`[NotificationService] Deleted ${result.count} expired notifications`);
    return result;
  } catch (error) {
    console.error('[NotificationService] Error deleting expired notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return count;
  } catch (error) {
    console.error('[NotificationService] Error getting unread count:', error);
    return 0;
  }
}
