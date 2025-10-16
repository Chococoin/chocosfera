import { Telegraf } from 'telegraf';

// Initialize Telegram bot
let bot: Telegraf | null = null;

export function getTelegramBot(): Telegraf {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
    }

    bot = new Telegraf(token);

    // Set up basic commands
    bot.command('start', (ctx) => {
      ctx.reply(
        '¡Bienvenido a Chocósfera! 🍫\n\n' +
        'Soy tu asistente virtual para todo lo relacionado con el cacao ético y sostenible.\n\n' +
        'Comandos disponibles:\n' +
        '/start - Mostrar este mensaje\n' +
        '/help - Ayuda\n' +
        '/profile - Ver tu perfil\n' +
        '/link - Vincular tu cuenta\n' +
        '/community - Unirte a la comunidad'
      );
    });

    bot.command('help', (ctx) => {
      ctx.reply(
        '📚 Ayuda de Chocósfera\n\n' +
        'Comandos disponibles:\n' +
        '/start - Mensaje de bienvenida\n' +
        '/help - Mostrar esta ayuda\n' +
        '/profile - Ver información de tu perfil\n' +
        '/link - Vincular tu cuenta de Chocósfera\n' +
        '/community - Información sobre la comunidad\n\n' +
        '¿Necesitas más ayuda? Visita: https://chocosfera.com'
      );
    });

    bot.command('community', (ctx) => {
      ctx.reply(
        '🌍 Comunidad Chocósfera\n\n' +
        'Únete a nuestra comunidad global de productores, comerciantes y amantes del cacao.\n\n' +
        '✨ Comparte tu historia\n' +
        '🤝 Conecta con otros miembros\n' +
        '📚 Aprende sobre cacao sostenible\n\n' +
        'Visita tu dashboard para más información.'
      );
    });
  }

  return bot;
}

export async function sendTelegramMessage(chatId: number, message: string) {
  const bot = getTelegramBot();
  return await bot.telegram.sendMessage(chatId, message);
}

export async function sendTelegramNotification(
  chatId: number,
  title: string,
  message: string
) {
  const bot = getTelegramBot();
  const formattedMessage = `*${title}*\n\n${message}`;

  return await bot.telegram.sendMessage(chatId, formattedMessage, {
    parse_mode: 'Markdown',
  });
}
