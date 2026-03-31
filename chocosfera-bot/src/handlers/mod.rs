pub mod callbacks;
pub mod commands;
pub mod dialogue;

use teloxide::prelude::*;
use teloxide::dispatching::UpdateFilterExt;

use crate::commands::Command;

pub fn handler_tree() -> Handler<'static, DependencyMap, Result<(), Box<dyn std::error::Error + Send + Sync>>, teloxide::dispatching::DpHandlerDescription> {
    dptree::entry()
        // Callback queries (inline keyboard buttons)
        .branch(
            Update::filter_callback_query()
                .endpoint(callbacks::handle_callback),
        )
        // Messages
        .branch(
            Update::filter_message()
                .branch(
                    dptree::entry()
                        .filter_command::<Command>()
                        .endpoint(commands::handle_command),
                )
                .branch(
                    dptree::entry()
                        .endpoint(dialogue::handle_text_message),
                ),
        )
}
