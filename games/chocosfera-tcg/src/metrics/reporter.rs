//! Reporter for displaying simulation results

use super::SimulatorResults;
use colored::Colorize;

/// Reporter for metrics analysis
pub struct Reporter;

impl Reporter {
    /// Print a summary report to the terminal
    pub fn print_summary(results: &SimulatorResults) {
        println!();
        println!("{}", "╔═══════════════════════════════════════════════════════════╗".bright_yellow());
        println!("{}", "║           📊 REPORTE DE SIMULACIÓN                        ║".bright_yellow());
        println!("{}", "╠═══════════════════════════════════════════════════════════╣".bright_yellow());
        println!("║ Partidas simuladas: {:>6}                                ║", results.total_games);
        println!("║ Duración promedio:  {:>6.1} turnos                        ║", results.avg_game_duration_turns);
        println!("║ Tiempo promedio:    {:>6.0} ms                            ║", results.avg_game_duration_ms);
        println!("{}", "╠═══════════════════════════════════════════════════════════╣".bright_yellow());
        println!("{}", "║ CONDICIONES DE VICTORIA                                   ║".bright_cyan());

        let total = results.total_games as f64;
        println!("║ • Eliminación:    {:>5} ({:>5.1}%)                        ║",
            results.victories_by_elimination,
            results.victories_by_elimination as f64 / total * 100.0);
        println!("║ • Dominación:     {:>5} ({:>5.1}%)                        ║",
            results.victories_by_domination,
            results.victories_by_domination as f64 / total * 100.0);
        println!("║ • Cosecha Total:  {:>5} ({:>5.1}%)                        ║",
            results.victories_by_harvest,
            results.victories_by_harvest as f64 / total * 100.0);

        println!("{}", "╠═══════════════════════════════════════════════════════════╣".bright_yellow());
        println!("{}", "║ MÉTRICAS DE BALANCE                                       ║".bright_cyan());
        println!("║ • Primera criatura (turno promedio): {:>4.1}               ║", results.avg_first_creature_turn);
        println!("║ • Turnos vacíos por partida:         {:>4.1}               ║", results.avg_empty_turns_per_game);
        println!("║ • Cartas jugadas por partida:        {:>4.1}               ║", results.avg_cards_played_per_game);
        println!("║ • Reacciones sin usar:               {:>4.1}%              ║", results.pct_reactions_unused);
        println!("║ • Win rate jugador 1:                {:>4.1}%              ║", results.player1_win_rate * 100.0);

        println!("{}", "╠═══════════════════════════════════════════════════════════╣".bright_yellow());

        if results.balance_alerts.is_empty() {
            println!("{}", "║ ✅ No hay alertas de balance                              ║".bright_green());
        } else {
            println!("{}", "║ ⚠️  ALERTAS DE BALANCE                                    ║".bright_red());
            for alert in &results.balance_alerts {
                let alert_str = format!("{}", alert);
                // Truncate if too long
                let display = if alert_str.len() > 54 {
                    format!("{}...", &alert_str[..51])
                } else {
                    alert_str
                };
                println!("║ • {:<54} ║", display);
            }
        }

        println!("{}", "╚═══════════════════════════════════════════════════════════╝".bright_yellow());
    }

    /// Print card analysis
    pub fn print_card_analysis(results: &SimulatorResults) {
        println!();
        println!("{}", "TOP 10 CARTAS MÁS JUGADAS:".bright_cyan().bold());
        for (i, (name, count)) in results.most_played_cards.iter().enumerate() {
            println!("{}. {} ({} veces)", i + 1, name.bright_white(), count);
        }

        if !results.highest_win_rate_cards.is_empty() {
            println!();
            println!("{}", "MAYOR WIN RATE (min 10 partidas):".bright_green().bold());
            for (name, rate) in &results.highest_win_rate_cards {
                let rate_pct = rate * 100.0;
                let color = if rate_pct > 60.0 { "🔥" } else { "  " };
                println!("{} {} - {:.1}%", color, name.bright_white(), rate_pct);
            }
        }

        if !results.lowest_win_rate_cards.is_empty() {
            println!();
            println!("{}", "MENOR WIN RATE (min 10 partidas):".bright_red().bold());
            for (name, rate) in &results.lowest_win_rate_cards {
                let rate_pct = rate * 100.0;
                let color = if rate_pct < 40.0 { "❄️" } else { "  " };
                println!("{} {} - {:.1}%", color, name.bright_white(), rate_pct);
            }
        }

        if !results.never_played_cards.is_empty() {
            println!();
            println!("{}", "CARTAS NUNCA JUGADAS:".bright_yellow().bold());
            for name in &results.never_played_cards {
                println!("  ⚠️  {}", name);
            }
        }
    }

    /// Print detailed alerts
    pub fn print_alerts(results: &SimulatorResults) {
        if results.balance_alerts.is_empty() {
            println!();
            println!("{}", "✅ No se detectaron problemas de balance.".bright_green());
            return;
        }

        println!();
        println!("{}", "⚠️  PROBLEMAS DE BALANCE DETECTADOS:".bright_red().bold());
        println!();

        for alert in &results.balance_alerts {
            println!("  • {}", alert);
        }

        println!();
        println!("{}", "RECOMENDACIONES:".bright_cyan().bold());

        for alert in &results.balance_alerts {
            match alert {
                super::BalanceAlert::GamesTooShort { .. } =>
                    println!("  → Considera aumentar HP inicial o reducir daño"),
                super::BalanceAlert::GamesTooLong { .. } =>
                    println!("  → Considera reducir HP o aumentar daño/producción"),
                super::BalanceAlert::TooManyEmptyTurns { .. } =>
                    println!("  → Aumentar cacao inicial o reducir costos de cartas"),
                super::BalanceAlert::FirstCreatureTooLate { .. } =>
                    println!("  → Reducir costo de criaturas básicas o aumentar cacao inicial"),
                super::BalanceAlert::ReactionsUnused { .. } =>
                    println!("  → Revisar costos de reacciones o mecánicas de combate"),
                super::BalanceAlert::CardNeverPlayed { card_name } =>
                    println!("  → Revisar costo/efecto de: {}", card_name),
                super::BalanceAlert::CardOverpowered { card_name, .. } =>
                    println!("  → Considerar nerf para: {}", card_name),
                super::BalanceAlert::CardUnderpowered { card_name, .. } =>
                    println!("  → Considerar buff para: {}", card_name),
                super::BalanceAlert::VictoryConditionDominates { condition, .. } =>
                    println!("  → Revisar condición de victoria: {}", condition),
            }
        }
    }

    /// Export results to JSON file
    pub fn export_json(results: &SimulatorResults, path: &str) -> Result<(), std::io::Error> {
        let json = serde_json::to_string_pretty(results)?;
        std::fs::write(path, json)?;
        Ok(())
    }
}
