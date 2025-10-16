# Telegram Integration Roadmap

## Overview

This document outlines the complete integration between the Chocósfera platform and Telegram, enabling bidirectional real-time communication between the web app and the Telegram group.

## Current Status: Phase 1 - Mock Implementation ✅

### Completed Features

- ✅ MongoDB message storage with reactions
- ✅ TypeScript type system for Telegram data
- ✅ API routes for messages and reactions
- ✅ Custom React hooks (useTelegramMessages, useTelegramReactions)
- ✅ TelegramChat UI component with reactions
- ✅ Seed script with 30 mock messages
- ✅ Real-time polling (5-second intervals)
- ✅ Interactive reaction system (❤️ 👍 🔥 😂 👏)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Current Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Next.js App                    MongoDB                      │
│  ┌──────────────┐              ┌──────────────┐            │
│  │              │    Read/Write │              │            │
│  │ TelegramChat ├──────────────►│  telegram_   │            │
│  │  Component   │               │   messages   │            │
│  │              │◄──────────────┤  collection  │            │
│  └──────────────┘    Mock Data  └──────────────┘            │
│                                                               │
│  - Polling every 5s                                          │
│  - Add/remove reactions                                      │
│  - Display messages                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Telegram Bot Integration (Next Steps)

### 2.1 Bot Setup & Webhook Configuration

**Goal**: Connect existing Abracadabra bot to write messages to MongoDB

**Tasks**:
- [ ] Configure bot webhook endpoint in Next.js: `POST /api/telegram/webhook`
- [ ] Implement webhook handler to store incoming messages
- [ ] Add message type handlers (text, photo, video, sticker)
- [ ] Implement error handling and retry logic
- [ ] Set up environment variables for bot token

**Bot Changes** (in `~/Documents/abracadabra`):
```javascript
// Add MongoDB write operations
bot.on('message', async (ctx) => {
  // Existing bot logic...

  // NEW: Store message in shared MongoDB
  await messagesCollection.insertOne({
    telegramMsgId: ctx.message.message_id,
    channelId: 'chocosfera_community',
    author: {
      telegramId: ctx.from.id.toString(),
      name: ctx.from.first_name,
      username: ctx.from.username,
      avatar: '👤', // Default or user-selected
    },
    content: ctx.message.text,
    messageType: 'text',
    timestamp: new Date(ctx.message.date * 1000),
    reactions: [],
    reactionCounts: {},
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(),
  });
});
```

**Estimated Time**: 4-6 hours

---

### 2.2 Telegram User Authentication

**Goal**: Link Telegram accounts to Chocósfera user accounts

**Tasks**:
- [ ] Create Telegram Login Widget integration
- [ ] Implement OAuth flow for Telegram authentication
- [ ] Store `telegramId` and `telegramUsername` in User table (already exists)
- [ ] Add "Link Telegram Account" button in Settings
- [ ] Add "Unlink Account" functionality
- [ ] Verify user permissions for posting

**User Flow**:
1. User clicks "Connect Telegram" in Settings
2. Telegram Login Widget opens
3. User authorizes with Telegram
4. System links `telegramId` to user account
5. User can now post messages to Telegram from web app

**Database** (PostgreSQL - already exists):
```sql
-- Users table already has:
-- telegramId: String?
-- telegramUsername: String?
-- telegramAccess: Boolean (default false)
```

**Estimated Time**: 6-8 hours

---

### 2.3 Bidirectional Message Sync

**Goal**: Messages posted in web app appear in Telegram and vice versa

**Tasks**:
- [ ] Implement `POST /api/telegram/send` endpoint
- [ ] Send messages from web to Telegram using Bot API
- [ ] Handle message confirmation and error states
- [ ] Implement edit message functionality
- [ ] Implement delete message functionality
- [ ] Add typing indicators
- [ ] Handle media uploads (images, videos)

**Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│              Bidirectional Sync Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Web User Types Message                                      │
│       │                                                       │
│       ▼                                                       │
│  POST /api/telegram/send                                     │
│       │                                                       │
│       ├──► MongoDB (store message)                           │
│       │                                                       │
│       └──► Telegram Bot API (send to group)                  │
│                    │                                          │
│                    ▼                                          │
│            Telegram Group Receives Message                   │
│                                                               │
│  ─────────────────────────────────────────────────────       │
│                                                               │
│  Telegram User Types Message                                 │
│       │                                                       │
│       ▼                                                       │
│  Bot Receives via Webhook                                    │
│       │                                                       │
│       └──► MongoDB (store message)                           │
│               │                                               │
│               ▼                                               │
│       Web App Polls and Displays                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Estimated Time**: 8-10 hours

---

### 2.4 Real-time Reactions Sync

**Goal**: Reactions added in Telegram appear in web and vice versa

**Tasks**:
- [ ] Implement Telegram reaction callback handlers
- [ ] Sync reactions from Telegram to MongoDB
- [ ] Send reaction updates from web to Telegram
- [ ] Handle reaction count updates
- [ ] Implement reaction animations

**Bot Handler** (Telegraf):
```javascript
bot.on('message_reaction', async (ctx) => {
  const { message_id, user, emoji } = ctx.messageReaction;

  // Update MongoDB
  await messagesCollection.updateOne(
    { telegramMsgId: message_id },
    {
      $push: { reactions: {
        userId: user.id.toString(),
        userName: user.first_name,
        reactionType: emoji,
        createdAt: new Date(),
      }},
      $inc: { [`reactionCounts.${emoji}`]: 1 },
    }
  );
});
```

**Estimated Time**: 4-6 hours

---

## Phase 3: Advanced Features

### 3.1 WebSocket Implementation

**Goal**: Replace polling with true real-time updates

**Tasks**:
- [ ] Set up Socket.io server
- [ ] Implement WebSocket connection in TelegramChat
- [ ] Emit message events from bot to web clients
- [ ] Handle connection drops and reconnection
- [ ] Implement presence indicators (typing, online status)

**Benefits**:
- Instant message updates (no 5-second delay)
- Reduced server load (no constant polling)
- Better user experience
- Typing indicators

**Estimated Time**: 6-8 hours

---

### 3.2 Message History Pagination

**Goal**: Load older messages on scroll

**Tasks**:
- [ ] Implement infinite scroll in TelegramChat
- [ ] Add "Load More" button for older messages
- [ ] Optimize MongoDB queries for large message sets
- [ ] Cache frequently accessed messages
- [ ] Implement message search functionality

**Estimated Time**: 4-6 hours

---

### 3.3 Rich Media Support

**Goal**: Support images, videos, stickers, GIFs

**Tasks**:
- [ ] Implement media upload from web app
- [ ] Store media URLs in MongoDB
- [ ] Display images/videos in TelegramChat
- [ ] Implement image lightbox viewer
- [ ] Add sticker picker
- [ ] Support Telegram-style GIFs
- [ ] Compress and optimize media files

**Estimated Time**: 8-12 hours

---

### 3.4 Notifications System

**Goal**: Notify users of new messages

**Tasks**:
- [ ] Browser push notifications for new messages
- [ ] Email notifications for mentions
- [ ] Notification preferences in Settings
- [ ] Unread message counter
- [ ] Message mention detection (@username)
- [ ] Sound notifications

**Estimated Time**: 6-8 hours

---

## Phase 4: Advanced Community Features

### 4.1 Threads and Replies

**Tasks**:
- [ ] Implement threaded conversations
- [ ] Reply-to functionality
- [ ] Thread view in UI
- [ ] Quote messages

**Estimated Time**: 8-10 hours

---

### 4.2 Message Moderation

**Tasks**:
- [ ] Admin panel for message moderation
- [ ] Flag/report messages
- [ ] Ban/mute users
- [ ] Auto-moderation rules
- [ ] Spam detection

**Estimated Time**: 10-12 hours

---

### 4.3 Analytics and Insights

**Tasks**:
- [ ] Message activity dashboard
- [ ] User engagement metrics
- [ ] Popular topics tracking
- [ ] Export conversation history
- [ ] Sentiment analysis

**Estimated Time**: 8-10 hours

---

## Technical Considerations

### Database Strategy

**MongoDB Collections**:
```javascript
// telegram_messages (current)
{
  _id: ObjectId,
  telegramMsgId: Number,
  channelId: String,
  author: {
    telegramId: String,
    name: String,
    username: String,
    avatar: String,
  },
  content: String,
  messageType: 'text' | 'photo' | 'video' | 'sticker',
  mediaUrl: String?,
  timestamp: Date,
  reactions: Array<Reaction>,
  reactionCounts: Object,
  isEdited: Boolean,
  isDeleted: Boolean,
  createdAt: Date,

  // Future fields:
  replyToMsgId: Number?,
  threadId: String?,
  mentions: Array<String>,
  mediaMetadata: Object?,
}
```

**Indexes** (already implemented):
- `{ channelId: 1, timestamp: -1 }` - Query by channel sorted by time
- `{ telegramMsgId: 1 }` (unique) - Prevent duplicates
- `{ 'author.telegramId': 1 }` - Query by author
- `{ isDeleted: 1 }` - Filter deleted messages

---

### Security Considerations

1. **Webhook Validation**: Verify Telegram webhook signatures
2. **Rate Limiting**: Prevent spam and abuse
3. **Authentication**: Verify user permissions before posting
4. **Input Sanitization**: Prevent XSS and injection attacks
5. **GDPR Compliance**: Handle user data deletion requests

---

### Performance Optimization

1. **Caching**: Redis for frequently accessed messages
2. **CDN**: Store media files in cloud storage (AWS S3, Cloudflare)
3. **Batch Operations**: Process multiple reactions in single DB operation
4. **Query Optimization**: Use MongoDB aggregation pipelines
5. **Connection Pooling**: Optimize MongoDB connections

---

## Integration with Abracadabra Bot

### Current Bot Location
`~/Documents/abracadabra`

### Bot Stack
- **Framework**: Telegraf.js 4.12.0
- **Database**: MongoDB (fractalbook)
- **Sessions**: Redis
- **Mode**: Polling

### Integration Strategy

**Option 1: Keep Bot Separate (Recommended)**
- Bot runs independently
- Both bot and app share same MongoDB
- Bot writes messages to `telegram_messages` collection
- App reads from same collection
- No code conflicts

**Option 2: Move Bot to Next.js**
- Move bot code to `/app/lib/telegram-bot.ts`
- Run bot as background process
- Single codebase
- More complex deployment

**Recommendation**: Keep bot separate (Option 1) for:
- Independent scaling
- Easier debugging
- No deployment conflicts
- Bot can restart without affecting web app

---

## Deployment Checklist

### Environment Variables
```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret

# MongoDB (already exists)
MONGODB_URI=mongodb://...

# Optional: Redis for caching
REDIS_URL=redis://...
```

### Bot Deployment
1. Keep bot running on current server
2. Ensure bot has access to shared MongoDB
3. Update bot to write to `telegram_messages` collection
4. Configure webhook URL to point to Next.js app

### App Deployment
1. Deploy Next.js app with new routes
2. Ensure MongoDB connection is stable
3. Configure webhook endpoint
4. Test bidirectional sync

---

## Testing Strategy

### Unit Tests
- [ ] API route tests
- [ ] Hook tests (useTelegramMessages, useTelegramReactions)
- [ ] Component tests (TelegramChat)
- [ ] Utility function tests

### Integration Tests
- [ ] Bot → MongoDB → App flow
- [ ] App → MongoDB → Bot flow
- [ ] Reaction sync
- [ ] Error handling

### E2E Tests
- [ ] User sends message from web
- [ ] Message appears in Telegram
- [ ] User reacts in Telegram
- [ ] Reaction appears in web
- [ ] Message edit/delete

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 ✅ | Mock implementation | **Completed** |
| Phase 2 | Telegram bot integration | 22-30 hours |
| Phase 3 | Advanced features | 24-32 hours |
| Phase 4 | Community features | 26-32 hours |
| **Total** | | **72-94 hours** |

---

## Next Immediate Steps

1. **Test Current Implementation** (1 hour)
   - Verify messages display correctly
   - Test reaction system
   - Check loading states

2. **Document Bot Integration** (2 hours)
   - Write bot modification guide
   - Document shared MongoDB schema
   - Create webhook handler specification

3. **Prepare Bot Changes** (4 hours)
   - Add MongoDB write operations to bot
   - Test bot in development
   - Verify no conflicts with existing functionality

4. **Implement Webhook Handler** (4 hours)
   - Create `/api/telegram/webhook` endpoint
   - Add signature verification
   - Test with Telegram test environment

---

## Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegraf.js Documentation](https://telegraf.js.org/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## Contact & Support

For questions about this implementation:
- Check `/docs/session-4-telegram-ui.md` for previous session notes
- Review code comments in:
  - `/types/telegram.ts`
  - `/app/api/telegram/messages/route.ts`
  - `/app/api/telegram/reactions/route.ts`
  - `/hooks/useTelegramMessages.ts`
  - `/components/TelegramChat.tsx`

---

**Last Updated**: 2025-10-16
**Status**: Phase 1 Complete, Ready for Phase 2
**Next Milestone**: Telegram Bot Integration
