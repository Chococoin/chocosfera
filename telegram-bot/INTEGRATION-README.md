# Telegram Bot - Integration Notes

## ⚠️ Important

This is the **Abracadabra** Telegram bot, integrated into the Chocósfera project for reference and future integration.

### DO NOT:
- ❌ Run `npm install` or reinstall dependencies
- ❌ Update packages in `package.json`
- ❌ Delete or modify `node_modules` (if present)
- ❌ Change existing functionality without testing in isolation

### Why?
The bot has deprecated dependencies that still work. Updating them may break functionality.

## What is this?

This bot handles:
- User registration and verification via Telegram
- Web3/blockchain integration
- Admin commands in the Telegram group
- Session management with Redis

## Integration Status

**Current**: Phase 1 Complete (Mock data in web app)

**Next**: Phase 2 will modify this bot to write messages to MongoDB's `telegram_messages` collection

## How to Run (Development)

```bash
cd telegram-bot
node bot.js
```

**Requirements**:
- MongoDB connection
- Redis connection
- Telegram Bot Token in `.env`

## Integration Architecture

```
Telegram Bot ──► MongoDB ◄── Next.js App
(this folder)   (shared)    (/app/api/telegram)
```

Both systems read/write to the same `telegram_messages` collection.

## Documentation

Full integration guide: `/docs/TELEGRAM-INTEGRATION-ROADMAP.md`

Bot location details: `/docs/TELEGRAM-BOT-LOCATION.md`

## Original Repository

This code was copied from: `~/Documents/abracadabra`

Original deployment: Heroku (fractalbook)

---

**For questions**: See main project documentation in `/docs`
