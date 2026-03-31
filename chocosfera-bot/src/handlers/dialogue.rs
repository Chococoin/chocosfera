use teloxide::prelude::*;

use crate::services::i18n::{get_lang, t};
use crate::state::AppState;

type HandlerResult = Result<(), Box<dyn std::error::Error + Send + Sync>>;

/// Handle free-text messages using keyword matching
pub async fn handle_text_message(
    bot: Bot,
    msg: Message,
    state: AppState,
) -> HandlerResult {
    let text = match msg.text() {
        Some(t) => t,
        None => return Ok(()),
    };

    let lang = get_lang(msg.from.as_ref().and_then(|u| u.language_code.as_deref()));
    let lower = text.to_lowercase();

    // Log incoming message
    if let Some(from) = msg.from.as_ref() {
        let _ = state.mongo.log_incoming_message(
            msg.id.0 as i64,
            &from.id.0.to_string(),
            &from.first_name,
            from.username.as_deref(),
            text,
        ).await;
    }

    // Keyword matching
    let response_key = if lower.contains("precio") || lower.contains("price") || lower.contains("prezzo") {
        "keyword_precio"
    } else if lower.contains("arbol") || lower.contains("tree") || lower.contains("albero") || lower.contains("adoptar") || lower.contains("adopt") {
        "keyword_arbol"
    } else if lower.contains("impacto") || lower.contains("impact") || lower.contains("co2") || lower.contains("carbono") {
        "keyword_impacto"
    } else {
        "keyword_default"
    };

    let response = t(lang, response_key, &[]);
    bot.send_message(msg.chat.id, &response).await?;
    let _ = state.mongo.log_bot_response(&response).await;

    Ok(())
}
