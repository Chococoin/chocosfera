use teloxide::utils::command::BotCommands;

#[derive(BotCommands, Clone)]
#[command(rename_rule = "lowercase", description = "Comandos disponibles:")]
pub enum Command {
    #[command(description = "Bienvenida e info")]
    Start,
    #[command(description = "Precio actual del cacao")]
    Precio,
    #[command(description = "Tus arboles adoptados")]
    Arboles,
    #[command(description = "Trazabilidad del cacao")]
    Trazabilidad,
    #[command(description = "Impacto ambiental y social")]
    Impacto,
    #[command(description = "Adoptar un arbol de cacao")]
    Adoptar,
    #[command(description = "Info de la comunidad")]
    Comunidad,
    #[command(description = "Ayuda")]
    Help,
}
