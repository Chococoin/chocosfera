mod commands;
mod config;
mod handlers;
mod keyboards;
mod mongo;
mod mongo_models;
mod services;
mod state;

use std::sync::Arc;

use teloxide::prelude::*;
use teloxide::utils::command::BotCommands;
use tracing::info;

use config::Config;
use mongo::MongoStore;
use state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("chocosfera_bot=info".parse().unwrap()),
        )
        .init();

    info!("Starting ChocBot - Chocosfera Cacao Bot");

    // Load configuration
    let config = Config::from_env()?;
    info!("Bot: {} (@{})", config.bot_name, config.bot_username);

    // Connect to MongoDB
    let mongo = MongoStore::connect(&config).await?;

    // Build app state
    let state = AppState {
        mongo,
        config: Arc::new(config.clone()),
    };

    // Create bot and delete any existing webhook
    let bot = Bot::new(&config.telegram_bot_token);
    bot.delete_webhook().await?;
    info!("Webhook cleared, using long-polling");

    // Set bot commands menu
    bot.set_my_commands(commands::Command::bot_commands()).await?;
    info!("Bot commands registered");

    // Start dispatcher
    Dispatcher::builder(bot, handlers::handler_tree())
        .dependencies(dptree::deps![state])
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;

    Ok(())
}
