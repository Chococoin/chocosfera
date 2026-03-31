use teloxide::prelude::*;

use crate::services::i18n::{get_lang, t};
use crate::state::AppState;

type HandlerResult = Result<(), Box<dyn std::error::Error + Send + Sync>>;

pub async fn handle_callback(
    bot: Bot,
    q: CallbackQuery,
    state: AppState,
) -> HandlerResult {
    let data = match q.data.as_deref() {
        Some(d) => d,
        None => return Ok(()),
    };

    bot.answer_callback_query(&q.id).await?;

    let chat_id = match q.message.as_ref().map(|m| m.chat().id) {
        Some(id) => id,
        None => return Ok(()),
    };

    let lang = get_lang(q.from.language_code.as_deref());
    let url = &state.config.app_url;

    let response = match data {
        "cacao_precio" => {
            let text = t(lang, "precio_result", &[
                ("market_price", "3,450"),
                ("fair_price", "4,209"),
                ("farmer_price", "4,200"),
                ("time", &chrono::Utc::now().format("%d/%m/%Y %H:%M").to_string()),
            ]);
            bot.send_message(chat_id, &text).await?;
            Some(text)
        }
        "cacao_arboles" => {
            let text = t(lang, "arboles_header", &[
                ("count", "12"),
                ("production", "248"),
                ("co2", "1.2"),
            ]);
            bot.send_message(chat_id, &text).await?;
            Some(text)
        }
        "cacao_trazabilidad" => {
            let text = t(lang, "trazabilidad", &[("url", url)]);
            bot.send_message(chat_id, &text).await?;
            Some(text)
        }
        "cacao_impacto" => {
            let text = t(lang, "impacto_header", &[
                ("co2", "288"),
                ("water", "1,200"),
                ("biodiversity", "12"),
                ("families", "8"),
                ("income", "1,440"),
            ]);
            bot.send_message(chat_id, &text).await?;
            Some(text)
        }
        "cacao_adoptar" => {
            let text = t(lang, "adoptar", &[("url", url)]);
            bot.send_message(chat_id, &text).await?;
            Some(text)
        }
        "cacao_comunidad" => {
            let msg_count = state.mongo.message_count().await.unwrap_or(0);
            let text = t(lang, "comunidad_stats", &[
                ("users", "2"),
                ("messages", &msg_count.to_string()),
                ("url", url),
            ]);
            bot.send_message(chat_id, &text).await?;
            Some(text)
        }
        _ => None,
    };

    if let Some(text) = response {
        let _ = state.mongo.log_bot_response(&text).await;
    }

    Ok(())
}
