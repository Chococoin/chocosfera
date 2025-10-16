/**
 * Seed Telegram Messages
 * Populates MongoDB with mock Telegram messages and reactions
 */

import { ObjectId } from 'mongodb';
import { getCollection, Collections } from '../lib/mongodb';
import type { TelegramMessage, TelegramAuthor } from '../types/telegram';

// Mock users for the community
const mockUsers: TelegramAuthor[] = [
  {
    telegramId: 'tg_001',
    name: 'Carlos',
    username: 'carlos_farmer',
    avatar: '👨‍🌾',
  },
  {
    telegramId: 'tg_002',
    name: 'María',
    username: 'maria_chocolatier',
    avatar: '👩‍🍳',
  },
  {
    telegramId: 'tg_003',
    name: 'Pedro',
    username: 'pedro_trader',
    avatar: '👨‍💼',
  },
  {
    telegramId: 'tg_004',
    name: 'Ana',
    username: 'ana_sustainability',
    avatar: '👩‍🔬',
  },
  {
    telegramId: 'tg_005',
    name: 'José',
    username: 'jose_cacao',
    avatar: '🧑‍🌾',
  },
];

// Mock messages content (Spanish - Colombian context)
const mockMessagesContent: string[] = [
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
  'El chocolate que hicimos la semana pasada quedó delicioso',
  '¿Usaste el cacao de tu finca?',
  'Sí, de la última cosecha. Tengo más si alguien necesita',
  'Yo quisiera probar, ¿cuánto tienes disponible?',
  'Tengo unos 50kg listos para enviar',
  '¡Perfecto! Te escribo por privado para coordinar',
  '¿Alguien más va a la feria de cacao en Medellín?',
  'Yo sí voy, estaré presentando mi chocolate artesanal',
  'Genial, nos vemos allá entonces',
  'Podríamos organizar un stand conjunto de la comunidad',
];

/**
 * Generate mock messages with realistic timestamps
 */
function generateMessages(count: number): Omit<TelegramMessage, '_id'>[] {
  const messages: Omit<TelegramMessage, '_id'>[] = [];
  const now = new Date();
  const channelId = 'chocosfera_community';

  for (let i = 0; i < count; i++) {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const randomContent = mockMessagesContent[Math.floor(Math.random() * mockMessagesContent.length)];

    // Create message timestamp (spread over last 3 hours)
    const minutesAgo = Math.floor(Math.random() * 180); // 0-180 minutes
    const timestamp = new Date(now.getTime() - minutesAgo * 60000);

    // Random reactions (30% chance of having reactions)
    const reactions = [];
    const reactionCounts: Record<string, number> = {};

    if (Math.random() > 0.7) {
      const reactionEmojis = ['❤️', '👍', '🔥', '😂', '👏'];
      const numReactions = Math.floor(Math.random() * 5) + 1; // 1-5 reactions

      for (let j = 0; j < numReactions; j++) {
        const randomReactionUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

        // Avoid duplicate reactions from same user
        const alreadyReacted = reactions.some(
          (r) => r.userId === `user_${randomReactionUser.telegramId}` && r.reactionType === randomEmoji
        );

        if (!alreadyReacted) {
          reactions.push({
            userId: `user_${randomReactionUser.telegramId}`, // Mock PostgreSQL user ID
            userName: randomReactionUser.name,
            userAvatar: randomReactionUser.avatar,
            reactionType: randomEmoji,
            createdAt: new Date(timestamp.getTime() + Math.random() * 60000), // Within 1 minute of message
          });

          reactionCounts[randomEmoji] = (reactionCounts[randomEmoji] || 0) + 1;
        }
      }
    }

    messages.push({
      telegramMsgId: 1000 + i,
      channelId,
      author: randomUser,
      content: randomContent,
      messageType: 'text',
      timestamp,
      reactions,
      reactionCounts,
      isEdited: false,
      isDeleted: false,
      createdAt: timestamp,
    });
  }

  // Sort by timestamp (oldest first)
  return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Main seed function
 */
async function seedTelegramMessages() {
  console.log('🌱 Starting Telegram messages seed...\n');

  try {
    // Get collection
    const messagesCollection = await getCollection<TelegramMessage>(
      Collections.TELEGRAM_MESSAGES
    );

    // Check if data already exists
    const existingCount = await messagesCollection.countDocuments();

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing messages.`);
      console.log('🗑️  Clearing existing data...\n');
      await messagesCollection.deleteMany({});
    }

    // Generate 30 mock messages
    console.log('📝 Generating 30 mock messages...');
    const mockMessages = generateMessages(30);

    // Insert messages
    console.log('💾 Inserting messages into MongoDB...');
    const result = await messagesCollection.insertMany(
      mockMessages.map((msg) => ({
        _id: new ObjectId(),
        ...msg,
      }))
    );

    console.log(`✅ Successfully inserted ${result.insertedCount} messages\n`);

    // Show statistics
    console.log('📊 Statistics:');
    console.log(`   - Total messages: ${result.insertedCount}`);
    console.log(`   - Unique users: ${mockUsers.length}`);

    const messagesWithReactions = mockMessages.filter((m) => m.reactions.length > 0);
    console.log(`   - Messages with reactions: ${messagesWithReactions.length}`);

    const totalReactions = mockMessages.reduce((sum, m) => sum + m.reactions.length, 0);
    console.log(`   - Total reactions: ${totalReactions}`);

    console.log('\n✨ Seed completed successfully!');
    console.log('🔗 View messages at: http://localhost:3000/dashboard/community\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Telegram messages:', error);
    process.exit(1);
  }
}

// Run seed
seedTelegramMessages();
