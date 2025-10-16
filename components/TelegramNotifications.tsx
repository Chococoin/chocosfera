'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TelegramNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  icon: string;
}

/**
 * Mock Telegram Notifications Component
 * Simulates receiving notifications from Telegram bot
 */
export function TelegramNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TelegramNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Mock notifications that could come from Telegram
  const mockNotifications = [
    {
      title: '🌳 Tree Update',
      message: 'Your cacao tree #127 has grown 5cm this week!',
      icon: '🌱',
    },
    {
      title: '📦 Marketplace Alert',
      message: 'New organic chocolate available in the marketplace',
      icon: '🍫',
    },
    {
      title: '👥 Community Message',
      message: 'New discussion: Best practices for cacao farming',
      icon: '💬',
    },
    {
      title: '🎉 Achievement Unlocked',
      message: 'You earned the "Green Thumb" badge!',
      icon: '🏆',
    },
    {
      title: '📊 Impact Report',
      message: 'Your monthly sustainability report is ready',
      icon: '📈',
    },
  ];

  useEffect(() => {
    // Only show notifications if user has Telegram linked
    if (!user?.telegramId) {
      return;
    }

    // Simulate receiving a notification every 30 seconds
    const interval = setInterval(() => {
      const randomNotification =
        mockNotifications[Math.floor(Math.random() * mockNotifications.length)];

      const newNotification: TelegramNotification = {
        id: `notif_${Date.now()}`,
        title: randomNotification.title,
        message: randomNotification.message,
        icon: randomNotification.icon,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Keep last 5
      setIsVisible(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 30000); // Every 30 seconds

    // Show initial notification after 3 seconds
    const initialTimeout = setTimeout(() => {
      const randomNotification =
        mockNotifications[Math.floor(Math.random() * mockNotifications.length)];

      const newNotification: TelegramNotification = {
        id: `notif_${Date.now()}`,
        title: randomNotification.title,
        message: randomNotification.message,
        icon: randomNotification.icon,
        timestamp: new Date(),
      };

      setNotifications([newNotification]);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.telegramId]);

  // Don't render if user doesn't have Telegram linked
  if (!user?.telegramId) {
    return null;
  }

  return (
    <>
      {/* Notification Toast */}
      {isVisible && notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-w-[calc(100vw-2rem)]">
            {/* Telegram Badge */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Telegram
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{user.telegramUsername}
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Notification Content */}
            <div className="flex items-start gap-3">
              <span className="text-3xl">{notifications[0].icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {notifications[0].title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notifications[0].message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {notifications[0].timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Mock indicator */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                🤖 Mock notification (simulated)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notification History Button */}
      {notifications.length > 0 && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          <span className="text-2xl">📱</span>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
      )}

      {/* Notification History Panel */}
      {isVisible && notifications.length > 1 && (
        <div className="fixed bottom-24 right-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-3 rounded-t-xl">
            <h3 className="font-bold">Recent Telegram Messages</h3>
          </div>
          <div className="p-2">
            {notifications.slice(1).map((notif) => (
              <div
                key={notif.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mb-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{notif.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {notif.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
