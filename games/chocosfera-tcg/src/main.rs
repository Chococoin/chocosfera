//! Chocósfera TCG - Terminal Card Game Simulator
//!
//! A trading card game inspired by cacao and nature.
//! Each Guardian represents a real cacao tree.

mod card;
mod cards_data;
mod player;
mod game;
mod ai;
mod ui;
mod metrics;
mod simulator;

use clap::{Parser, Subcommand};
use colored::Colorize;
use game::{Game, GamePhase};
use ai::{AI, AIAction};
use ui::{Command, display_board, display_actions, display_messages,
         display_reaction_prompt, display_victory, display_welcome,
         display_mode_selection, display_help, display_card_details,
         get_input, parse_command, clear_screen};
use simulator::{Simulator, SimulatorConfig, SimulatorMode};
use metrics::reporter::Reporter;

/// Chocósfera TCG - Simulador de juego de cartas
#[derive(Parser)]
#[command(name = "chocosfera-tcg")]
#[command(author = "Chocosfera Team")]
#[command(version = "0.2.0")]
#[command(about = "Simulador de TCG con sistema de métricas para balance")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Jugar una partida interactiva
    Play {
        /// Jugar contra la IA
        #[arg(long, default_value = "true")]
        vs_ai: bool,
    },

    /// Ejecutar simulaciones automatizadas
    Simulate {
        /// Número de partidas a simular
        #[arg(short, long, default_value = "100")]
        games: u32,

        /// Guardar resultados en archivo JSON
        #[arg(short, long)]
        output: Option<String>,

        /// Exportar a CSV
        #[arg(long)]
        csv: Option<String>,

        /// Mostrar progreso detallado
        #[arg(short, long)]
        verbose: bool,
    },

    /// Simulación rápida con reporte
    QuickSim {
        /// Número de partidas
        #[arg(default_value = "100")]
        games: u32,
    },

    /// Cargar y mostrar reporte de simulación anterior
    Report {
        /// Archivo JSON de entrada
        #[arg(short, long)]
        input: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Play { vs_ai }) => {
            run_interactive_game(vs_ai);
        }
        Some(Commands::Simulate { games, output, csv, verbose }) => {
            run_simulation(games, output, csv, verbose);
        }
        Some(Commands::QuickSim { games }) => {
            simulator::quick_simulate(games);
        }
        Some(Commands::Report { input }) => {
            show_report(&input);
        }
        None => {
            // Default: interactive mode
            run_interactive_menu();
        }
    }
}

fn run_interactive_menu() {
    display_welcome();
    display_mode_selection();

    loop {
        let input = get_input(">");
        match input.as_str() {
            "1" => {
                run_game(true);
                break;
            }
            "2" => {
                run_game(false);
                break;
            }
            "3" => {
                display_help();
                display_welcome();
                display_mode_selection();
            }
            "4" => {
                // Quick simulation
                println!();
                println!("{}", "Simulación rápida (100 partidas)...".bright_cyan());
                simulator::quick_simulate(100);
                println!();
                display_mode_selection();
            }
            "q" | "quit" | "salir" => {
                println!("¡Hasta luego! 🍫");
                return;
            }
            _ => {
                println!("{}", "Opción inválida. Usa 1, 2, 3, 4 o q".red());
            }
        }
    }
}

fn run_interactive_game(vs_ai: bool) {
    display_welcome();
    run_game(vs_ai);
}

fn run_simulation(games: u32, output: Option<String>, csv: Option<String>, verbose: bool) {
    let config = SimulatorConfig {
        num_games: games,
        mode: SimulatorMode::AIvsAI,
        verbose,
        max_turns: 50,
    };

    let mut simulator = Simulator::new(config);
    let results = simulator.run();

    Reporter::print_summary(&results);
    Reporter::print_card_analysis(&results);
    Reporter::print_alerts(&results);

    if let Some(path) = output {
        match simulator.save(&path) {
            Ok(_) => println!("\n✅ Resultados guardados en: {}", path),
            Err(e) => println!("\n❌ Error guardando resultados: {}", e),
        }
    }

    if let Some(path) = csv {
        match simulator.export_csv(&path) {
            Ok(_) => println!("✅ CSV exportado en: {}", path),
            Err(e) => println!("❌ Error exportando CSV: {}", e),
        }
    }
}

fn show_report(input: &str) {
    match metrics::storage::MetricsStorage::load_from_file(input) {
        Ok(mut storage) => {
            let results = storage.analyze();
            Reporter::print_summary(&results);
            Reporter::print_card_analysis(&results);
            Reporter::print_alerts(&results);
        }
        Err(e) => {
            println!("❌ Error cargando archivo: {}", e);
        }
    }
}

fn run_game(vs_ai: bool) {
    clear_screen();
    println!("🎮 Nueva Partida\n");

    let p1_name = get_input("Nombre del Jugador 1:");
    let p1_name = if p1_name.is_empty() { "Jugador 1".to_string() } else { p1_name };

    let p2_name = if vs_ai {
        "Guardián IA".to_string()
    } else {
        let name = get_input("Nombre del Jugador 2:");
        if name.is_empty() { "Jugador 2".to_string() } else { name }
    };

    let mut game = Game::new(&p1_name, &p2_name, vs_ai);

    loop {
        match game.phase {
            GamePhase::StartPhase => {
                let messages = game.start_turn();
                display_board(&game);
                display_messages(&messages);

                if !game.current().is_human {
                    std::thread::sleep(std::time::Duration::from_millis(500));
                } else {
                    get_input("Presiona Enter para continuar...");
                }
            }

            GamePhase::ProductionPhase => {
                let messages = game.production_phase();
                display_board(&game);
                display_messages(&messages);

                if !game.current().is_human {
                    std::thread::sleep(std::time::Duration::from_millis(500));
                } else {
                    get_input("Presiona Enter para continuar...");
                }
            }

            GamePhase::MainPhase => {
                if game.current().is_human {
                    display_board(&game);
                    display_actions(&game);

                    let input = get_input(">");
                    if let Some(cmd) = parse_command(&input) {
                        let messages = handle_command(&mut game, cmd);
                        if !messages.is_empty() {
                            display_messages(&messages);
                            get_input("");
                        }
                    } else {
                        println!("Comando no reconocido.");
                        get_input("");
                    }
                } else {
                    display_board(&game);
                    std::thread::sleep(std::time::Duration::from_millis(800));

                    match AI::decide_main_phase(&game) {
                        AIAction::PlayCard(idx) => {
                            let card_name = game.current().hand.get(idx)
                                .map(|c| c.name.clone())
                                .unwrap_or_default();

                            match game.play_card(idx) {
                                Ok(messages) => {
                                    println!("🤖 IA juega: {}", card_name);
                                    display_messages(&messages);
                                    std::thread::sleep(std::time::Duration::from_millis(1000));
                                }
                                Err(e) => {
                                    println!("🤖 IA error: {}", e);
                                }
                            }
                        }
                        AIAction::UseAbility(idx) => {
                            match game.use_ability(idx) {
                                Ok(messages) => {
                                    display_messages(&messages);
                                    std::thread::sleep(std::time::Duration::from_millis(1000));
                                }
                                Err(_) => {}
                            }
                        }
                        AIAction::EndPhase => {
                            let messages = game.start_combat();
                            display_messages(&messages);
                            std::thread::sleep(std::time::Duration::from_millis(500));
                        }
                        _ => {}
                    }
                }
            }

            GamePhase::CombatPhase => {
                if game.current().is_human {
                    display_board(&game);
                    display_actions(&game);

                    let input = get_input(">");
                    if let Some(cmd) = parse_command(&input) {
                        let messages = handle_command(&mut game, cmd);
                        if !messages.is_empty() {
                            display_messages(&messages);

                            if game.reaction_window_open {
                                handle_reaction_window(&mut game);
                            }

                            get_input("");
                        }
                    }
                } else {
                    display_board(&game);

                    let attacks = AI::decide_combat(&game);
                    if attacks.is_empty() {
                        let messages = game.end_turn();
                        display_messages(&messages);
                        std::thread::sleep(std::time::Duration::from_millis(1000));
                    } else {
                        for (attacker, target) in attacks {
                            match game.attack_with_creature(attacker, target) {
                                Ok(messages) => {
                                    display_messages(&messages);
                                    std::thread::sleep(std::time::Duration::from_millis(800));

                                    if game.reaction_window_open {
                                        handle_reaction_window(&mut game);
                                    }
                                }
                                Err(_) => {}
                            }
                        }

                        let messages = game.end_turn();
                        display_messages(&messages);
                        std::thread::sleep(std::time::Duration::from_millis(1000));
                    }
                }
            }

            GamePhase::EndPhase => {
                let messages = game.end_turn();
                display_board(&game);
                display_messages(&messages);
                get_input("");
            }
        }

        if game.is_game_over() {
            display_victory(&game);
            get_input("");
            break;
        }
    }

    let input = get_input("¿Jugar de nuevo? (s/n)");
    if input.to_lowercase() == "s" || input.to_lowercase() == "si" {
        run_game(vs_ai);
    }
}

fn handle_command(game: &mut Game, cmd: Command) -> Vec<String> {
    match cmd {
        Command::PlayCard(idx) => {
            match game.play_card(idx) {
                Ok(messages) => messages,
                Err(e) => vec![format!("❌ {}", e)],
            }
        }
        Command::UseAbility(idx) => {
            match game.use_ability(idx) {
                Ok(messages) => messages,
                Err(e) => vec![format!("❌ {}", e)],
            }
        }
        Command::ViewCard(idx) => {
            if let Some(card) = game.current().hand.get(idx) {
                display_card_details(card);
            } else if let Some(card) = game.current().field.get(idx) {
                display_card_details(card);
            } else {
                return vec!["❌ Carta no encontrada".to_string()];
            }
            Vec::new()
        }
        Command::Attack(attacker, target) => {
            match game.attack_with_creature(attacker, target) {
                Ok(messages) => messages,
                Err(e) => vec![format!("❌ {}", e)],
            }
        }
        Command::StartCombat => {
            game.start_combat()
        }
        Command::EndPhase => {
            match game.phase {
                GamePhase::MainPhase => game.start_combat(),
                GamePhase::CombatPhase => game.end_turn(),
                _ => Vec::new(),
            }
        }
        Command::Quit => {
            println!("¡Hasta luego! 🍫");
            std::process::exit(0);
        }
        _ => Vec::new(),
    }
}

fn handle_reaction_window(game: &mut Game) {
    let defender_is_human = game.opponent().is_human;

    if defender_is_human {
        display_reaction_prompt(game);
        let input = get_input(">");

        if let Some(cmd) = parse_command(&input) {
            match cmd {
                Command::UseReaction(idx) => {
                    if game.opponent_mut().use_reaction(idx).is_some() {
                        let messages = game.resolve_pending_attack(true);
                        display_messages(&messages);
                    } else {
                        let messages = game.resolve_pending_attack(false);
                        display_messages(&messages);
                    }
                }
                Command::Pass => {
                    let messages = game.resolve_pending_attack(false);
                    display_messages(&messages);
                }
                _ => {
                    let messages = game.resolve_pending_attack(false);
                    display_messages(&messages);
                }
            }
        } else {
            let messages = game.resolve_pending_attack(false);
            display_messages(&messages);
        }
    } else {
        let should_react = game.opponent().reactions.iter()
            .enumerate()
            .find(|(i, _)| AI::should_use_reaction(game, *i));

        if let Some((idx, _)) = should_react {
            println!("🤖 IA usa reacción: {}", game.opponent().reactions[idx].name);
            game.opponent_mut().use_reaction(idx);
            let messages = game.resolve_pending_attack(true);
            display_messages(&messages);
        } else {
            let messages = game.resolve_pending_attack(false);
            display_messages(&messages);
        }
    }
}
