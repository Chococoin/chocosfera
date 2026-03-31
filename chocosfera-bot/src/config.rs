use anyhow::{Context, Result};

#[derive(Clone, Debug)]
pub struct Config {
    pub telegram_bot_token: String,
    pub mongodb_uri: String,
    pub mongodb_db_name: String,
    pub chocosfera_database_url: String,
    pub channel_id: String,
    pub bot_name: String,
    pub bot_avatar: String,
    pub bot_username: String,
    pub app_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            telegram_bot_token: std::env::var("TELEGRAM_BOT_TOKEN")
                .context("TELEGRAM_BOT_TOKEN required")?,
            mongodb_uri: std::env::var("MONGODB_URI")
                .unwrap_or_else(|_| "mongodb://localhost:27017".to_string()),
            mongodb_db_name: std::env::var("MONGODB_DB_NAME")
                .unwrap_or_else(|_| "chocosfera".to_string()),
            chocosfera_database_url: std::env::var("CHOCOSFERA_DATABASE_URL")
                .unwrap_or_else(|_| String::new()),
            channel_id: std::env::var("CHANNEL_ID")
                .unwrap_or_else(|_| "chocosfera_community".to_string()),
            bot_name: std::env::var("BOT_NAME")
                .unwrap_or_else(|_| "ChocBot".to_string()),
            bot_avatar: std::env::var("BOT_AVATAR")
                .unwrap_or_else(|_| "\u{1F36B}".to_string()), // 🍫
            bot_username: std::env::var("BOT_USERNAME")
                .unwrap_or_else(|_| "chocosfera_bot".to_string()),
            app_url: std::env::var("APP_URL")
                .unwrap_or_else(|_| "http://vps23658.cubepath.net".to_string()),
        })
    }
}
