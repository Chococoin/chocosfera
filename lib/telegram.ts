import { Telegraf } from 'telegraf';

// Initialize Telegram bot
let bot: Telegraf | null = null;

/**
 * Get Telegraf bot instance.
 * Command handling is now done by the Rust chocosfera-bot process.
 * This instance is only used for sending notifications from the server.
 */
export function getTelegramBot(): Telegraf {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
    }

    bot = new Telegraf(token);
    // No command handlers - bot logic handled by Rust chocosfera-bot
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
