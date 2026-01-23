//! Terminal UI for Chocósfera TCG

use crate::card::{Card, CardType};
use crate::game::{Game, GamePhase};
use crate::player::Player;
use colored::*;
use std::io::{self, Write};

/// Display the game board
pub fn display_board(game: &Game) {
    clear_screen();
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!("{}", "                    🍫 CHOCÓSFERA TCG 🍫                        ".bright_yellow().bold());
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!();

    // Show turn and phase info
    println!("{} {} | {}",
        "Turno".bright_cyan(),
        game.turn_number.to_string().white().bold(),
        game.phase.to_string().bright_magenta());
    println!();

    // Show opponent (top)
    let opponent_idx = game.opponent_index();
    display_player_zone(&game.players[opponent_idx], false);

    println!("{}", "───────────────────────────────────────────────────────────────".bright_black());

    // Show current player (bottom)
    display_player_zone(game.current(), true);

    // Show current player's hand
    println!();
    println!("{}", "Tu Mano:".bright_green().bold());
    display_hand(game.current());
}

/// Display a player's board zone
fn display_player_zone(player: &Player, is_current: bool) {
    let name_color = if is_current {
        player.name.bright_green().bold()
    } else {
        player.name.bright_red().bold()
    };

    // Player stats line
    println!("{} {} | {} {} | {} {} | {} {} | {} {}",
        name_color,
        "",
        "❤️".red(),
        format!("{}/20", player.hp).white(),
        "🫘".yellow(),
        player.cacao.to_string().yellow(),
        "✨".bright_magenta(),
        format!("{}/{}", player.spirit, player.max_spirit).bright_magenta(),
        "📚".bright_blue(),
        player.deck.len().to_string().bright_blue(),
    );

    // Victory progress
    println!("  {} {} | {} {}/20",
        "👑 Guardianes:".bright_cyan(),
        format!("{}/3", player.count_guardians()).white(),
        "🏆 Cosecha:".bright_yellow(),
        player.total_cacao_harvested.to_string().white(),
    );

    // Place card
    if let Some(ref place) = player.place {
        println!("  {} {}", "🏞️".bright_green(), place.name.bright_green());
    }

    // Field creatures
    println!("  {}:", "Campo".bright_white().bold());
    if player.field.is_empty() {
        println!("    {}", "(vacío)".bright_black());
    } else {
        for (i, card) in player.field.iter().enumerate() {
            let card_display = format_card_inline(card, i, is_current);
            println!("    {}", card_display);
        }
    }

    // Reactions (only show count for opponent)
    if !player.reactions.is_empty() {
        if is_current {
            println!("  {} ({})",
                "🛡️ Reacciones".bright_cyan(),
                player.reactions.iter().map(|r| r.name.as_str()).collect::<Vec<_>>().join(", "));
        } else {
            println!("  {} {}",
                "🛡️ Reacciones:".bright_cyan(),
                player.reactions.len().to_string().white());
        }
    }
}

/// Format a card for inline display
fn format_card_inline(card: &Card, index: usize, show_details: bool) -> String {
    let type_icon = match card.card_type {
        CardType::Guardian => "🌳",
        CardType::Spirit => "👻",
        _ => "?",
    };

    let mut parts = vec![
        format!("[{}]", index).bright_black().to_string(),
        type_icon.to_string(),
        card.name.bright_white().bold().to_string(),
    ];

    if let Some(ref stats) = card.stats {
        parts.push(format!("💪{}", card.get_strength()).red().to_string());
        parts.push(format!("🛡️{}/{}", stats.current_hp, stats.resistance).blue().to_string());
        if card.card_type == CardType::Guardian {
            parts.push(format!("🫘{}", stats.production).yellow().to_string());
        }
        parts.push(format!("⚡{}", stats.speed).bright_cyan().to_string());
    }

    if let Some(ref keyword) = card.keyword {
        parts.push(format!("[{}]", keyword).bright_magenta().to_string());
    }

    if show_details {
        if !card.can_attack {
            parts.push("(no ataca)".bright_black().to_string());
        }
        if card.ability_used {
            parts.push("(habilidad usada)".bright_black().to_string());
        }
        if card.has_poison {
            parts.push("☠️".red().to_string());
        }
    }

    parts.join(" ")
}

/// Display a player's hand
fn display_hand(player: &Player) {
    if player.hand.is_empty() {
        println!("  {}", "(mano vacía)".bright_black());
        return;
    }

    for (i, card) in player.hand.iter().enumerate() {
        let type_icon = match card.card_type {
            CardType::Guardian => "🌳",
            CardType::Spirit => "👻",
            CardType::Resource => "🫘",
            CardType::Action => "⚡",
            CardType::Reaction => "🛡️",
            CardType::Place => "🏞️",
        };

        let cost_color = if player.can_pay_cacao(card.cacao_cost) {
            format!("{}🫘", card.cacao_cost).green()
        } else {
            format!("{}🫘", card.cacao_cost).red()
        };

        let mut line = format!("  [{}] {} {} {}",
            i.to_string().bright_yellow(),
            type_icon,
            card.name.bright_white(),
            cost_color);

        // Add stats for creatures
        if let Some(ref stats) = card.stats {
            line.push_str(&format!(" | 💪{} 🛡️{} ⚡{}",
                stats.strength.to_string().red(),
                stats.resistance.to_string().blue(),
                stats.speed.to_string().bright_cyan()));

            if card.card_type == CardType::Guardian {
                line.push_str(&format!(" 🫘{}", stats.production.to_string().yellow()));
            }
        }

        // Add effect for non-creatures
        if let Some(ref effect) = card.effect {
            if !card.is_creature() {
                line.push_str(&format!(" | {}", effect.bright_black()));
            }
        }

        // Add keyword
        if let Some(ref keyword) = card.keyword {
            line.push_str(&format!(" [{}]", keyword.to_string().bright_magenta()));
        }

        // Add ability
        if let Some(ref ability) = card.ability {
            line.push_str(&format!(" | {}: {} ({}✨)",
                ability.name.bright_cyan(),
                ability.description.bright_black(),
                ability.spirit_cost));
        }

        println!("{}", line);
    }
}

/// Display card details
pub fn display_card_details(card: &Card) {
    println!();
    println!("{}", "┌─────────────────────────────────────┐".bright_yellow());
    println!("│ {} {}", card.card_type.to_string().bright_magenta(), card.name.bright_white().bold());

    if let Some(ref keyword) = card.keyword {
        println!("│ {}: {}", keyword.to_string().bright_cyan(), keyword.description().bright_black());
    }

    if let Some(ref stats) = card.stats {
        println!("│ 💪 {} | 🛡️ {} | ⚡ {}",
            stats.strength.to_string().red(),
            stats.resistance.to_string().blue(),
            stats.speed.to_string().bright_cyan());
        if card.card_type == CardType::Guardian {
            println!("│ 🫘 {} producción | ✨ {} espíritu",
                stats.production.to_string().yellow(),
                stats.spirit.to_string().bright_magenta());
        }
    }

    if let Some(ref ability) = card.ability {
        println!("│ ✨ {}: {} ({}✨)",
            ability.name.bright_green(),
            ability.description,
            ability.spirit_cost);
    }

    if let Some(ref effect) = card.effect {
        println!("│ 📜 {}", effect.bright_black());
    }

    println!("{}", "└─────────────────────────────────────┘".bright_yellow());
}

/// Display available actions
pub fn display_actions(game: &Game) {
    println!();
    println!("{}", "Acciones:".bright_yellow().bold());

    match game.phase {
        GamePhase::MainPhase => {
            println!("  {} - Jugar carta [índice]", "j [n]".bright_green());
            println!("  {} - Usar habilidad [índice criatura]", "h [n]".bright_green());
            println!("  {} - Ver detalles carta [índice]", "v [n]".bright_green());
            println!("  {} - Ir a Fase de Combate", "c".bright_green());
            println!("  {} - Terminar turno", "f".bright_green());
        }
        GamePhase::CombatPhase => {
            println!("  {} - Atacar con [atacante] a [objetivo] o jugador", "a [n] [m/p]".bright_green());
            println!("  {} - Terminar combate", "f".bright_green());
        }
        _ => {
            println!("  {} - Continuar", "enter".bright_green());
        }
    }

    println!("  {} - Salir del juego", "q".bright_red());
}

/// Display reaction prompt
pub fn display_reaction_prompt(game: &Game) {
    println!();
    println!("{}", "⚠️ ¡VENTANA DE REACCIÓN!".bright_yellow().bold());

    let opponent = game.opponent();
    if opponent.reactions.is_empty() {
        println!("  {}", "(Sin reacciones disponibles)".bright_black());
    } else {
        for (i, reaction) in opponent.reactions.iter().enumerate() {
            let can_afford = reaction.spirit_cost.map(|c| opponent.spirit >= c).unwrap_or(true);
            let status = if can_afford {
                "✓".green()
            } else {
                "✗".red()
            };

            println!("  [{}] {} {} | {} | {}✨",
                i.to_string().bright_yellow(),
                status,
                reaction.name.bright_cyan(),
                reaction.effect.as_ref().unwrap_or(&String::new()).bright_black(),
                reaction.spirit_cost.unwrap_or(0));
        }
    }

    println!();
    println!("  {} - Usar reacción", "r [n]".bright_green());
    println!("  {} - No reaccionar", "n".bright_green());
}

/// Display messages
pub fn display_messages(messages: &[String]) {
    if !messages.is_empty() {
        println!();
        for msg in messages {
            println!("  {}", msg);
        }
    }
}

/// Display victory screen
pub fn display_victory(game: &Game) {
    clear_screen();
    println!();
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!("{}", "                      🏆 ¡FIN DEL JUEGO! 🏆                     ".bright_yellow().bold());
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!();

    if let crate::game::GameResult::Victory { winner, ref condition } = game.result {
        println!("  {} {}",
            "🎉 Ganador:".bright_green(),
            game.players[winner].name.bright_white().bold());
        println!("  {} {}",
            "🏅 Condición:".bright_cyan(),
            condition.to_string().bright_magenta());
    }

    println!();
    println!("{}", "───────────────────────────────────────────────────────────────".bright_black());
    println!();

    for (i, player) in game.players.iter().enumerate() {
        let label = if i == 0 { "Jugador 1" } else { "Jugador 2" };
        println!("  {} {}", label.bright_yellow(), player.name.bright_white());
        println!("    ❤️ HP Final: {}", player.hp);
        println!("    🫘 Cacao Cosechado: {}", player.total_cacao_harvested);
        println!("    👑 Guardianes: {}", player.count_guardians());
        println!();
    }

    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!();
    println!("  {} para salir", "Presiona Enter".bright_green());
}

/// Get user input
pub fn get_input(prompt: &str) -> String {
    print!("{} ", prompt.bright_cyan());
    io::stdout().flush().unwrap();

    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    input.trim().to_string()
}

/// Parse command from input
pub fn parse_command(input: &str) -> Option<Command> {
    let parts: Vec<&str> = input.trim().split_whitespace().collect();

    if parts.is_empty() {
        return Some(Command::Continue);
    }

    match parts[0].to_lowercase().as_str() {
        "q" | "quit" | "salir" => Some(Command::Quit),
        "j" | "jugar" | "play" => {
            parts.get(1)
                .and_then(|s| s.parse().ok())
                .map(Command::PlayCard)
        }
        "h" | "habilidad" | "ability" => {
            parts.get(1)
                .and_then(|s| s.parse().ok())
                .map(Command::UseAbility)
        }
        "v" | "ver" | "view" => {
            parts.get(1)
                .and_then(|s| s.parse().ok())
                .map(Command::ViewCard)
        }
        "a" | "atacar" | "attack" => {
            let attacker = parts.get(1).and_then(|s| s.parse().ok())?;
            let target = parts.get(2).map(|s| {
                if *s == "p" || *s == "player" || *s == "jugador" {
                    None
                } else {
                    s.parse().ok()
                }
            }).unwrap_or(None);
            Some(Command::Attack(attacker, target))
        }
        "c" | "combate" | "combat" => Some(Command::StartCombat),
        "f" | "fin" | "end" => Some(Command::EndPhase),
        "r" | "reaccion" | "reaction" => {
            parts.get(1)
                .and_then(|s| s.parse().ok())
                .map(Command::UseReaction)
        }
        "n" | "no" | "pass" => Some(Command::Pass),
        "" => Some(Command::Continue),
        _ => None,
    }
}

/// User command
#[derive(Debug)]
pub enum Command {
    PlayCard(usize),
    UseAbility(usize),
    ViewCard(usize),
    Attack(usize, Option<usize>),
    StartCombat,
    EndPhase,
    UseReaction(usize),
    Pass,
    Continue,
    Quit,
}

/// Clear terminal screen
pub fn clear_screen() {
    print!("\x1B[2J\x1B[1;1H");
    io::stdout().flush().unwrap();
}

/// Display welcome screen
pub fn display_welcome() {
    clear_screen();
    println!();
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!("{}", r"
    ██████╗██╗  ██╗ ██████╗  ██████╗ ██████╗ ███████╗███████╗███████╗██████╗  █████╗
   ██╔════╝██║  ██║██╔═══██╗██╔════╝██╔═══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗
   ██║     ███████║██║   ██║██║     ██║   ██║███████╗█████╗  █████╗  ██████╔╝███████║
   ██║     ██╔══██║██║   ██║██║     ██║   ██║╚════██║██╔══╝  ██╔══╝  ██╔══██╗██╔══██║
   ╚██████╗██║  ██║╚██████╔╝╚██████╗╚██████╔╝███████║██║     ███████╗██║  ██║██║  ██║
    ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
".bright_green());
    println!("{}", "                           🍫 TCG - Trading Card Game 🍫                        ".bright_yellow());
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!();
    println!("  {}", "Un juego de cartas inspirado en el cacao y la naturaleza".bright_white());
    println!("  {}", "Cada Guardián representa un árbol de cacao real.".bright_black());
    println!();
    println!("  {}", "Condiciones de Victoria:".bright_cyan().bold());
    println!("    💀 {} - Reduce el HP del oponente a 0", "Eliminación".bright_red());
    println!("    👑 {} - Controla 3+ Guardianes al final del turno", "Dominación".bright_yellow());
    println!("    🫘 {} - Cosecha 20+ cacao en total", "Cosecha Total".bright_green());
    println!();
}

/// Display game mode selection
pub fn display_mode_selection() {
    println!("  {}", "Selecciona modo de juego:".bright_yellow().bold());
    println!();
    println!("    [1] 🤖 vs IA");
    println!("    [2] 👥 2 Jugadores");
    println!("    [3] ❓ Ayuda");
    println!("    [4] 📊 Simulación (100 partidas)");
    println!("    [q] 🚪 Salir");
    println!();
}

/// Display help screen
pub fn display_help() {
    clear_screen();
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!("{}", "                         📖 AYUDA 📖                            ".bright_yellow().bold());
    println!("{}", "═══════════════════════════════════════════════════════════════".bright_yellow());
    println!();

    println!("{}", "Tipos de Cartas:".bright_cyan().bold());
    println!("  🌳 {} - Criaturas principales que producen cacao", "Guardián".bright_green());
    println!("  👻 {} - Criaturas de apoyo sin producción", "Espíritu".bright_magenta());
    println!("  🫘 {} - Generan cacao instantáneo", "Recurso".yellow());
    println!("  ⚡ {} - Efectos de un solo uso", "Acción".bright_cyan());
    println!("  🛡️ {} - Se activan en turno enemigo", "Reacción".bright_blue());
    println!("  🏞️ {} - Efectos permanentes", "Lugar".bright_green());
    println!();

    println!("{}", "Palabras Clave:".bright_cyan().bold());
    println!("  🌸 {} - Efecto al entrar al campo", "Floración".bright_magenta());
    println!("  🌾 {} - +2🫘 al eliminar enemigo", "Cosecha".yellow());
    println!("  🌿 {} - Bonus por tener aliados", "Raíces".bright_green());
    println!("  🌙 {} - Bonus si tienes menos criaturas", "Nocturno".bright_blue());
    println!("  🌺 {} - Al usar habilidad, aliados ganan buff", "Polinización".bright_magenta());
    println!("  🗡️ {} - Ignora 2 puntos de defensa", "Perforar".red());
    println!("  ☠️ {} - Enemigo pierde 1HP al inicio de su turno", "Veneno".bright_red());
    println!();

    println!("{}", "Sistema de Espíritu:".bright_cyan().bold());
    println!("  ✨ Se regenera al máximo cada turno");
    println!("  ✨ Máximo = min(turno, 5)");
    println!("  ✨ Se usa para habilidades y reacciones");
    println!();

    println!("{}", "Fases del Turno:".bright_cyan().bold());
    println!("  1. 🌅 {} - Robar carta, regenerar espíritu, veneno", "Inicio".bright_yellow());
    println!("  2. 🫘 {} - Guardianes producen cacao", "Producción".yellow());
    println!("  3. 🎴 {} - Jugar cartas, usar habilidades", "Principal".bright_green());
    println!("  4. ⚔️ {} - Atacar por orden de velocidad", "Combate".red());
    println!("  5. 🌙 {} - Verificar victoria", "Fin".bright_blue());
    println!();

    println!("{}", "Presiona Enter para volver...".bright_black());
    get_input("");
}
