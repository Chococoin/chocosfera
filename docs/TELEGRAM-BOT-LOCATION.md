# Telegram Bot (Abracadabra) - Location & Integration

## Bot Location

**Path**: `/telegram-bot` (within this repository)

**Original Path**: `~/Documents/abracadabra` (still exists independently)

**Status**: Active - Do NOT modify dependencies or reinstall node_modules

## Bot Overview

### Technology Stack
- **Framework**: Telegraf.js 4.12.0
- **Database**: MongoDB (fractalbook database)
- **Sessions**: Redis
- **Deployment**: Heroku (fractalbook.git)
- **Mode**: Polling

### Key Files
```
/telegram-bot/
├── bot.js                 # Main bot logic
├── package.json          # Dependencies (DO NOT UPDATE)
├── Scenes/               # Conversation flows
│   ├── userRegister.js
│   ├── userVerification.js
│   └── ...
├── contracts/            # Web3 integration
├── utils/                # Helper utilities
├── Schemas/              # Data schemas
├── .env                  # Bot configuration (gitignored)
├── .gitignore
└── README.md
```

## Current Bot Functionality

### Existing Features
1. **User Registration** - Scene-based user onboarding
2. **User Verification** - Identity verification flow
3. **Web3 Integration** - Blockchain functionality
4. **Admin Commands** - Group moderation
5. **Session Management** - Redis-based sessions

### Database Structure
The bot uses MongoDB collection in `fractalbook` database:
- Users collection
- Session data
- Bot-specific data

## Integration with Chocósfera

### Shared Resources
Both the bot and Chocósfera app will share:
- **MongoDB Database**: Same MongoDB instance
- **telegram_messages Collection**: New collection for messages

### Architecture
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  /telegram-bot/                Chocósfera App       │
│  (Telegram Bot)                (Next.js)            │
│        │                              │              │
│        │                              │              │
│        ├──────────► MongoDB ◄─────────┤             │
│        │         (Shared DB)           │             │
│        │                              │              │
│        │  Write Messages              │              │
│        │  to telegram_messages        │              │
│        │                              │              │
│        │                     Read & Write            │
│        │                     Messages/Reactions      │
│        │                              │              │
└─────────────────────────────────────────────────────┘
```

## How They Work Together

### Message Flow: Telegram → Web App
1. User posts message in Telegram group
2. Bot receives via webhook/polling
3. Bot writes to `telegram_messages` collection in MongoDB
4. Web app polls MongoDB every 5 seconds
5. Message appears in web interface

### Message Flow: Web App → Telegram
1. User posts message in web interface
2. Web app writes to `telegram_messages` collection
3. Web app calls Telegram Bot API via `/api/telegram/send`
4. Message appears in Telegram group
5. Bot receives its own message and stores (avoiding duplicates)

### Reaction Flow
1. User reacts to message (either platform)
2. System updates `telegram_messages.reactions[]` array
3. Both platforms read updated reactions from MongoDB

## Bot Modifications Needed (Phase 2)

### 1. Add MongoDB Write Handler
Add to `/telegram-bot/bot.js`:

```javascript
// Import MongoDB client (use same URI as Chocósfera)
const { MongoClient } = require('mongodb');
const mongoUri = process.env.CHOCOSFERA_MONGODB_URI; // Add to .env
const mongoClient = new MongoClient(mongoUri);

// Connect to shared database
await mongoClient.connect();
const db = mongoClient.db('chocosfera');
const messagesCollection = db.collection('telegram_messages');

// Message handler
bot.on('message', async (ctx) => {
  // ... existing bot logic ...

  // NEW: Store in shared collection
  try {
    await messagesCollection.insertOne({
      telegramMsgId: ctx.message.message_id,
      channelId: 'chocosfera_community',
      author: {
        telegramId: ctx.from.id.toString(),
        name: ctx.from.first_name,
        username: ctx.from.username || '',
        avatar: '👤', // Could map to user avatar
      },
      content: ctx.message.text || '',
      messageType: ctx.message.photo ? 'photo' :
                   ctx.message.video ? 'video' :
                   ctx.message.sticker ? 'sticker' : 'text',
      mediaUrl: ctx.message.photo ?
                ctx.message.photo[ctx.message.photo.length - 1].file_id :
                null,
      timestamp: new Date(ctx.message.date * 1000),
      reactions: [],
      reactionCounts: {},
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error storing message:', error);
  }
});
```

### 2. Add Reaction Handler
```javascript
bot.on('message_reaction', async (ctx) => {
  const { message_id, user, emoji } = ctx.messageReaction;

  try {
    await messagesCollection.updateOne(
      { telegramMsgId: message_id },
      {
        $push: {
          reactions: {
            userId: `tg_${user.id}`,
            userName: user.first_name,
            userAvatar: '👤',
            reactionType: emoji,
            createdAt: new Date(),
          }
        },
        $inc: { [`reactionCounts.${emoji}`]: 1 },
      }
    );
  } catch (error) {
    console.error('Error updating reaction:', error);
  }
});
```

### 3. Environment Variables to Add
Add to `/telegram-bot/.env`:
```bash
# Shared MongoDB (same as Chocósfera)
CHOCOSFERA_MONGODB_URI=mongodb+srv://...

# Optional: Webhook secret
TELEGRAM_WEBHOOK_SECRET=your_secret_here
```

## Important Notes

### DO NOT:
- ❌ Reinstall node_modules (deprecated libraries but working)
- ❌ Update dependencies in package.json
- ❌ Move the bot to a different location
- ❌ Change existing bot functionality
- ❌ Modify Heroku deployment config

### DO:
- ✅ Add new message handler code
- ✅ Add new environment variables
- ✅ Test in development before deploying
- ✅ Keep bot running independently
- ✅ Monitor MongoDB connection

## Testing Strategy

### Development Testing
1. Run bot locally: `cd telegram-bot && node bot.js`
2. Send test message in Telegram group
3. Check MongoDB collection: `db.telegram_messages.find()`
4. Verify message appears in web app

### Production Deployment
1. Test changes locally first
2. Deploy to Heroku: `git push heroku main`
3. Monitor logs: `heroku logs --tail -a fractalbook`
4. Verify no conflicts with existing functionality

## Maintenance

### Bot Status
- Check if running: `heroku ps -a fractalbook`
- View logs: `heroku logs --tail -a fractalbook`
- Restart if needed: `heroku restart -a fractalbook`

### MongoDB Connection
- Both bot and app use same MongoDB instance
- Monitor connection pool usage
- Ensure proper error handling

## Contact

For questions about bot integration:
- Review: `/docs/TELEGRAM-INTEGRATION-ROADMAP.md`
- Bot code: `/telegram-bot/bot.js`
- Web app API: `/app/api/telegram/`

---

**Last Updated**: 2025-10-16
**Bot Version**: Abracadabra v1.0 (Telegraf 4.12.0)
**Status**: Ready for integration (Phase 2)
