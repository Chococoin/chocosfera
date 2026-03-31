use teloxide::types::{InlineKeyboardButton, InlineKeyboardMarkup};

pub fn main_menu_keyboard() -> InlineKeyboardMarkup {
    InlineKeyboardMarkup::new(vec![
        vec![
            InlineKeyboardButton::callback("\u{1F4CA} Precio", "cacao_precio"),
            InlineKeyboardButton::callback("\u{1F333} Arboles", "cacao_arboles"),
        ],
        vec![
            InlineKeyboardButton::callback("\u{1F50D} Trazabilidad", "cacao_trazabilidad"),
            InlineKeyboardButton::callback("\u{1F30D} Impacto", "cacao_impacto"),
        ],
        vec![
            InlineKeyboardButton::callback("\u{1F331} Adoptar", "cacao_adoptar"),
            InlineKeyboardButton::callback("\u{1F4AC} Comunidad", "cacao_comunidad"),
        ],
    ])
}
