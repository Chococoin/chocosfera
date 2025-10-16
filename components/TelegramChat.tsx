'use client';

import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegramMessages } from '@/hooks/useTelegramMessages';
import { useTelegramReactions } from '@/hooks/useTelegramReactions';
import type { TelegramMessage, ReactionEmoji } from '@/types/telegram';
import { REACTION_EMOJIS } from '@/types/telegram';

interface TelegramChatProps {
  channelName?: string;
  height?: number;
}

/**
 * TelegramChat Component
 * Displays Telegram messages with reactions system
 * Uses MongoDB for data storage with mock data
 */
export function TelegramChat({ channelName = 'Chocósfera Community', height = 500 }: TelegramChatProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages with polling (every 5 seconds)
  const { messages, isLoading, error } = useTelegramMessages({
    channelId: 'chocosfera_community',
    pollInterval: 5000,
  });

  // Reactions hook
  const { addReaction, removeReaction, isLoading: reactionsLoading } = useTelegramReactions();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle reaction toggle
  const handleReactionToggle = async (message: TelegramMessage, emoji: ReactionEmoji) => {
    if (!user) return;

    // Check if user already reacted with this emoji
    const userReaction = message.reactions?.find(
      (r) => r.userId === user.id && r.reactionType === emoji
    );

    if (userReaction) {
      // Remove reaction
      await removeReaction({
        messageId: message._id.toString(),
        userId: user.id,
        reactionType: emoji,
      });
    } else {
      // Add reaction
      await addReaction({
        messageId: message._id.toString(),
        userId: user.id,
        userName: user.nick,
        userAvatar: user.avatarUrl || undefined,
        reactionType: emoji,
      });
    }
  };

  // Check if user has reacted with specific emoji
  const hasUserReacted = (message: TelegramMessage, emoji: ReactionEmoji): boolean => {
    if (!user) return false;
    return message.reactions?.some(
      (r) => r.userId === user.id && r.reactionType === emoji
    ) || false;
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-3 flex items-center gap-3 border-b border-blue-600">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
          🍫
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">{channelName}</h3>
          <p className="text-xs text-white/80">
            {messages.length} mensajes • {isLoading ? 'Cargando...' : 'En línea'}
          </p>
        </div>
        <div className="text-white/80 text-sm">
          📱
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        style={{ height: `${height}px` }}
      >
        {/* Loading State */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando mensajes...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => {
          // Check if this is the first message from this user in a sequence
          const isFirstInSequence = index === 0 || messages[index - 1].author.telegramId !== msg.author.telegramId;

          return (
            <div key={msg._id.toString()} className="flex gap-3 group">
              {/* Avatar - only show for first message in sequence */}
              <div className="flex-shrink-0">
                {isFirstInSequence ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-xl shadow-md">
                    {msg.author.avatar}
                  </div>
                ) : (
                  <div className="w-10" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {/* Username - only show for first message in sequence */}
                {isFirstInSequence && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                      {msg.author.name}
                    </span>
                    {msg.author.username && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        @{msg.author.username}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className="group/message relative">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-600 inline-block max-w-[85%]">
                    <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                      {msg.content}
                    </p>
                  </div>

                  {/* Timestamp - appears on hover */}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                    {formatTime(msg.timestamp)}
                  </span>

                  {/* Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {REACTION_EMOJIS.map((emoji) => {
                        const count = msg.reactionCounts?.[emoji] || 0;
                        if (count === 0) return null;

                        const userHasReacted = hasUserReacted(msg, emoji);

                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReactionToggle(msg, emoji)}
                            disabled={reactionsLoading || !user}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                              userHasReacted
                                ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700'
                                : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className={userHasReacted ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Reaction Picker - shows on hover */}
                  {user && (
                    <div className="absolute left-0 top-full mt-1 opacity-0 group-hover/message:opacity-100 transition-opacity pointer-events-none group-hover/message:pointer-events-auto z-10">
                      <div className="bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1 flex gap-1">
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReactionToggle(msg, emoji)}
                            disabled={reactionsLoading}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-lg"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input (disabled/read-only for mock) */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white dark:bg-gray-700 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-600 flex items-center gap-2 opacity-50">
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              📝 Escribe un mensaje...
            </span>
          </div>
          <button
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white opacity-50 cursor-not-allowed"
            disabled
          >
            ✈️
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 italic">
          🤖 Vista previa con datos mock de MongoDB
        </p>
      </div>
    </div>
  );
}
