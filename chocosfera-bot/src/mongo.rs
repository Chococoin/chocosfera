use anyhow::{Context, Result};
use chrono::Utc;
use mongodb::{Client, Collection, Database};
use mongodb::bson::doc;
use mongodb::options::FindOptions;
use std::collections::HashMap;
use tracing::info;

use crate::config::Config;
use crate::mongo_models::{MongoAuthor, MongoTelegramMessage};

#[derive(Clone)]
pub struct MongoStore {
    db: Database,
    channel_id: String,
    bot_author: MongoAuthor,
}

impl MongoStore {
    pub async fn connect(config: &Config) -> Result<Self> {
        let client = Client::with_uri_str(&config.mongodb_uri)
            .await
            .context("Failed to connect to MongoDB")?;
        let db = client.database(&config.mongodb_db_name);

        // Verify connection
        db.run_command(doc! { "ping": 1 }).await
            .context("MongoDB ping failed")?;
        info!("Connected to MongoDB: {}", config.mongodb_db_name);

        Ok(Self {
            db,
            channel_id: config.channel_id.clone(),
            bot_author: MongoAuthor {
                telegram_id: "bot".to_string(),
                name: config.bot_name.clone(),
                username: Some(config.bot_username.clone()),
                avatar: config.bot_avatar.clone(),
            },
        })
    }

    fn collection(&self) -> Collection<MongoTelegramMessage> {
        self.db.collection("telegram_messages")
    }

    /// Get next available telegramMsgId
    async fn next_msg_id(&self) -> Result<i64> {
        let opts = FindOptions::builder()
            .sort(doc! { "telegramMsgId": -1 })
            .limit(1)
            .build();
        let mut cursor = self.collection().find(doc! {}).with_options(opts).await?;
        if cursor.advance().await? {
            let msg = cursor.deserialize_current()?;
            Ok(msg.telegram_msg_id + 1)
        } else {
            Ok(3000) // Start after seed data range
        }
    }

    /// Write an incoming user message to MongoDB
    pub async fn log_incoming_message(
        &self,
        telegram_msg_id: i64,
        author_telegram_id: &str,
        author_name: &str,
        author_username: Option<&str>,
        content: &str,
    ) -> Result<()> {
        let now = Utc::now();
        let doc = MongoTelegramMessage {
            id: None,
            telegram_msg_id,
            channel_id: self.channel_id.clone(),
            author: MongoAuthor {
                telegram_id: author_telegram_id.to_string(),
                name: author_name.to_string(),
                username: author_username.map(|s| s.to_string()),
                avatar: "\u{1F464}".to_string(), // 👤
            },
            content: content.to_string(),
            message_type: "text".to_string(),
            media_url: None,
            timestamp: now,
            reactions: vec![],
            reaction_counts: HashMap::new(),
            is_edited: false,
            is_deleted: false,
            created_at: now,
        };
        self.collection().insert_one(doc).await?;
        Ok(())
    }

    /// Write a bot response to MongoDB so it appears in the web UI
    pub async fn log_bot_response(&self, content: &str) -> Result<()> {
        let now = Utc::now();
        let msg_id = self.next_msg_id().await?;
        let doc = MongoTelegramMessage {
            id: None,
            telegram_msg_id: msg_id,
            channel_id: self.channel_id.clone(),
            author: self.bot_author.clone(),
            content: content.to_string(),
            message_type: "text".to_string(),
            media_url: None,
            timestamp: now,
            reactions: vec![],
            reaction_counts: HashMap::new(),
            is_edited: false,
            is_deleted: false,
            created_at: now,
        };
        self.collection().insert_one(doc).await?;
        Ok(())
    }

    /// Get message count for stats
    pub async fn message_count(&self) -> Result<u64> {
        let count = self.collection()
            .count_documents(doc! { "channelId": &self.channel_id, "isDeleted": false })
            .await?;
        Ok(count)
    }
}
