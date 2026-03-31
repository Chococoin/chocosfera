use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Matches the TypeScript TelegramMessage schema in types/telegram.ts exactly.
/// Field names use camelCase to match existing MongoDB documents.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MongoTelegramMessage {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub telegram_msg_id: i64,
    pub channel_id: String,
    pub author: MongoAuthor,
    pub content: String,
    pub message_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_url: Option<String>,
    pub timestamp: DateTime<Utc>,
    #[serde(default)]
    pub reactions: Vec<MongoReaction>,
    #[serde(default)]
    pub reaction_counts: HashMap<String, i32>,
    #[serde(default)]
    pub is_edited: bool,
    #[serde(default)]
    pub is_deleted: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MongoAuthor {
    pub telegram_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    pub avatar: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MongoReaction {
    pub user_id: String,
    pub user_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_avatar: Option<String>,
    pub reaction_type: String,
    pub created_at: DateTime<Utc>,
}
