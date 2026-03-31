use teloxide::prelude::*;
use teloxide::types::ParseMode;

use crate::commands::Command;
use crate::keyboards::main_menu_keyboard;
use crate::services::i18n::{get_lang, t};
use crate::state::AppState;

type HandlerResult = Result<(), Box<dyn std::error::Error + Send + Sync>>;

pub async fn handle_command(
    bot: Bot,
    msg: Message,
    cmd: Command,
    state: AppState,
) -> HandlerResult {
    let lang = get_lang(msg.from.as_ref().and_then(|u| u.language_code.as_deref()));
    let name = msg.from.as_ref().map(|u| u.first_name.as_str()).unwrap_or("amigo");
    let url = &state.config.app_url;

    // Log incoming command to MongoDB
    if let Some(from) = msg.from.as_ref() {
        let _ = state.mongo.log_incoming_message(
            msg.id.0 as i64,
            &from.id.0.to_string(),
            &from.first_name,
            from.username.as_deref(),
            msg.text().unwrap_or(""),
        ).await;
    }

    let response = match cmd {
        Command::Start => {
            let text = t(lang, "start", &[("name", name)]);
            bot.send_message(msg.chat.id, &text)
                .reply_markup(main_menu_keyboard())
                .await?;
            text
        }
        Command::Help => {
            let text = t(lang, "help", &[]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
        Command::Precio => {
            let text = t(lang, "precio_result", &[
                ("market_price", "3,450"),
                ("fair_price", "4,209"),
                ("farmer_price", "4,200"),
                ("time", &chrono::Utc::now().format("%d/%m/%Y %H:%M").to_string()),
            ]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
        Command::Arboles => {
            // TODO: Read from PostgreSQL when chocosfera_db is connected
            let text = t(lang, "arboles_header", &[
                ("count", "12"),
                ("production", "248"),
                ("co2", "1.2"),
            ]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
        Command::Trazabilidad => {
            let text = t(lang, "trazabilidad", &[("url", url)]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
        Command::Impacto => {
            let text = t(lang, "impacto_header", &[
                ("co2", "288"),
                ("water", "1,200"),
                ("biodiversity", "12"),
                ("families", "8"),
                ("income", "1,440"),
            ]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
        Command::Adoptar => {
            let text = t(lang, "adoptar", &[("url", url)]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
        Command::Comunidad => {
            let msg_count = state.mongo.message_count().await.unwrap_or(0);
            let text = t(lang, "comunidad_stats", &[
                ("users", "2"),
                ("messages", &msg_count.to_string()),
                ("url", url),
            ]);
            bot.send_message(msg.chat.id, &text).await?;
            text
        }
    };

    // Log bot response to MongoDB
    let _ = state.mongo.log_bot_response(&response).await;

    Ok(())
}
