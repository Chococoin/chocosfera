'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TelegramMessage {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isOwn?: boolean;
}

interface TelegramChatProps {
  channelName?: string;
  height?: number;
}

/**
 * TelegramChat Component
 * Replicates Telegram group chat UI with messages from different users
 */
export function TelegramChat({ channelName = 'Chocósfera Community', height = 500 }: TelegramChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock users in the community
  const mockUsers = [
    {
      userId: 'user_1',
      username: 'carlos_farmer',
      firstName: 'Carlos',
      avatar: '👨‍🌾',
    },
    {
      userId: 'user_2',
      username: 'maria_chocolatier',
      firstName: 'María',
      avatar: '👩‍🍳',
    },
    {
      userId: 'user_3',
      username: 'pedro_trader',
      firstName: 'Pedro',
      avatar: '👨‍💼',
    },
    {
      userId: 'user_4',
      username: 'ana_sustainability',
      firstName: 'Ana',
      avatar: '👩‍🔬',
    },
    {
      userId: 'user_5',
      username: 'jose_cacao',
      firstName: 'José',
      avatar: '🧑‍🌾',
    },
  ];

  // Mock messages content
  const mockMessagesContent = [
    '¡Hola a todos! ¿Cómo va la cosecha este año?',
    'Muy bien, este año tenemos una producción excelente 🌱',
    '¿Alguien ha probado los nuevos métodos de fermentación?',
    'Sí, yo los implementé el mes pasado y los resultados son increíbles',
    '¡Qué bueno! ¿Podrías compartir más detalles?',
    'Claro, básicamente controlo mejor la temperatura durante 5-7 días',
    'Interesante, yo también quiero probar eso',
    '¿Hay alguien en la zona de Santander?',
    'Yo estoy en Bucaramanga, ¿necesitas algo?',
    'Perfecto, podríamos coordinar un intercambio de semillas',
    'Me encantaría participar también 🙋‍♂️',
    'El precio del cacao ha subido esta semana',
    'Sí, vi las noticias. Es una buena oportunidad para vender',
    '¿Alguien tiene contacto con compradores certificados?',
    'Yo trabajo con varios, te puedo pasar información',
    'Gracias! Me ayudaría mucho',
    '¿Cuándo es la próxima reunión de la comunidad?',
    'Creo que es el próximo viernes a las 3pm',
    'Perfecto, ahí estaré 👍',
    '¡Excelente! Vamos a hablar sobre nuevas certificaciones',
  ];

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with some messages and simulate new ones
  useEffect(() => {
    // Add initial messages
    const initialMessages: TelegramMessage[] = [];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomMessage = mockMessagesContent[Math.floor(Math.random() * mockMessagesContent.length)];

      initialMessages.push({
        id: `msg_${Date.now()}_${i}`,
        userId: randomUser.userId,
        username: randomUser.username,
        firstName: randomUser.firstName,
        avatar: randomUser.avatar,
        message: randomMessage,
        timestamp: new Date(now.getTime() - (8 - i) * 180000), // 3 minutes apart
        isOwn: false,
      });
    }

    setMessages(initialMessages);

    // Simulate new messages arriving every 15 seconds
    const interval = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomMessage = mockMessagesContent[Math.floor(Math.random() * mockMessagesContent.length)];

      const newMessage: TelegramMessage = {
        id: `msg_${Date.now()}`,
        userId: randomUser.userId,
        username: randomUser.username,
        firstName: randomUser.firstName,
        avatar: randomUser.avatar,
        message: randomMessage,
        timestamp: new Date(),
        isOwn: false,
      };

      setMessages((prev) => [...prev, newMessage]);
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
            {messages.length} mensajes • {mockUsers.length} miembros en línea
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
        {messages.map((msg, index) => {
          // Check if this is the first message from this user in a sequence
          const isFirstInSequence = index === 0 || messages[index - 1].userId !== msg.userId;

          return (
            <div key={msg.id} className="flex gap-3 group">
              {/* Avatar - only show for first message in sequence */}
              <div className="flex-shrink-0">
                {isFirstInSequence ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-xl shadow-md">
                    {msg.avatar}
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
                      {msg.firstName}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      @{msg.username}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className="group relative">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-600 inline-block max-w-[85%]">
                    <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                      {msg.message}
                    </p>
                  </div>

                  {/* Timestamp - appears on hover */}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(msg.timestamp)}
                  </span>
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
          🤖 Vista previa en modo lectura (mock)
        </p>
      </div>
    </div>
  );
}
