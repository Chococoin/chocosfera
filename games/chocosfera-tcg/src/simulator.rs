//! Automated game simulator for balance testing

use crate::ai::{AI, AIAction};
use crate::card::CardType;
use crate::game::{Game, GamePhase, GameResult, VictoryCondition};
use crate::metrics::collector::{DamageTarget, MetricsCollector};
use crate::metrics::reporter::Reporter;
use crate::metrics::storage::MetricsStorage;
use crate::metrics::{GameMode, MetricVictoryCondition, SimulatorResults};

/// Simulator configuration
#[derive(Clone, Debug)]
pub struct SimulatorConfig {
    pub num_games: u32,
    pub mode: SimulatorMode,
    pub verbose: bool,
    pub max_turns: u32,  // Safety limit to prevent infinite games
}

impl Default for SimulatorConfig {
    fn default() -> Self {
        SimulatorConfig {
            num_games: 100,
            mode: SimulatorMode::AIvsAI,
            verbose: false,
            max_turns: 50,
        }
    }
}

/// Simulation modes
#[derive(Clone, Debug)]
pub enum SimulatorMode {
    AIvsAI,
}

/// Game simulator for running automated matches
pub struct Simulator {
    config: SimulatorConfig,
    storage: MetricsStorage,
}

impl Simulator {
    pub fn new(config: SimulatorConfig) -> Self {
        Simulator {
            config,
            storage: MetricsStorage::new(),
        }
    }

    /// Run all simulations
    pub fn run(&mut self) -> SimulatorResults {
        println!("🎮 Iniciando {} simulaciones...", self.config.num_games);
        println!();

        for i in 0..self.config.num_games {
            if self.config.verbose || (i > 0 && i % 100 == 0) {
                println!("  Simulación {}/{}", i + 1, self.config.num_games);
            }

            let metrics = self.run_single_game(i as u64);
            self.storage.add_game(metrics);
        }

        println!();
        println!("✅ Simulaciones completadas");
        println!();

        self.storage.analyze()
    }

    /// Run a single game and collect metrics
    fn run_single_game(&mut self, game_id: u64) -> crate::metrics::GameMetrics {
        let mut game = Game::new("IA 1", "IA 2", true);
        // Both players are AI
        game.players[0].is_human = false;
        game.players[1].is_human = false;

        let mut collector = MetricsCollector::new(game_id, GameMode::AIvAI);
        let mut turn_count = 0u32;

        // Game loop
        loop {
            turn_count += 1;

            // Safety check
            if turn_count > self.config.max_turns {
                break;
            }

            match game.phase {
                GamePhase::StartPhase => {
                    let player_idx = game.current_player as u8;
                    collector.on_turn_start(game.current(), player_idx, game.turn_number as u32);

                    // Track cacao from production that will happen
                    let _messages = game.start_turn();
                    collector.on_card_drawn(player_idx);
                }

                GamePhase::ProductionPhase => {
                    let player_idx = game.current_player as u8;
                    let production = game.current().field.iter()
                        .filter(|c| c.card_type == CardType::Guardian)
                        .map(|c| c.get_production())
                        .sum();

                    collector.on_cacao_generated(production, player_idx);
                    let _messages = game.production_phase();
                }

                GamePhase::MainPhase => {
                    let player_idx = game.current_player as u8;

                    // AI decides what to do
                    match AI::decide_main_phase(&game) {
                        AIAction::PlayCard(idx) => {
                            if let Some(card) = game.current().hand.get(idx).cloned() {
                                if game.play_card(idx).is_ok() {
                                    collector.on_card_played(&card, player_idx, game.turn_number as u32);

                                    // Track cacao from resource cards
                                    if card.card_type == CardType::Resource {
                                        match card.name.as_str() {
                                            "Grano de Cacao" => collector.on_cacao_generated(2, player_idx),
                                            "Lluvia" => collector.on_cacao_generated(1, player_idx),
                                            "Abono" => collector.on_cacao_generated(4, player_idx),
                                            _ => {}
                                        }
                                    }
                                    if card.card_type == CardType::Action && card.name == "Cosecha Dorada" {
                                        collector.on_cacao_generated(3, player_idx);
                                    }
                                }
                            }
                        }
                        AIAction::UseAbility(idx) => {
                            if let Some(card) = game.current().field.get(idx) {
                                if let Some(ref ability) = card.ability {
                                    let spirit_cost = ability.spirit_cost;
                                    let card_clone = card.clone();
                                    if game.use_ability(idx).is_ok() {
                                        collector.on_ability_used(&card_clone, player_idx, spirit_cost);
                                    }
                                }
                            }
                        }
                        AIAction::EndPhase => {
                            let _messages = game.start_combat();
                        }
                        _ => {
                            let _messages = game.start_combat();
                        }
                    }
                }

                GamePhase::CombatPhase => {
                    let player_idx = game.current_player as u8;

                    // Get AI combat decisions
                    let attacks = AI::decide_combat(&game);

                    if attacks.is_empty() {
                        collector.on_turn_end(game.current(), player_idx);
                        let _messages = game.end_turn();
                    } else {
                        for (attacker_idx, target) in attacks {
                            if let Some(attacker) = game.current().field.get(attacker_idx) {
                                let damage = attacker.get_strength();

                                if game.attack_with_creature(attacker_idx, target).is_ok() {
                                    // Resolve attack (no reactions in simulation for simplicity)
                                    let attack_cancelled = false;

                                    if let Some(t_idx) = target {
                                        // Attack creature
                                        let target_died = {
                                            if let Some(target_creature) = game.opponent().field.get(t_idx) {
                                                target_creature.get_current_hp() <= damage
                                            } else {
                                                false
                                            }
                                        };

                                        collector.on_damage_dealt(damage, DamageTarget::Creature, player_idx);

                                        if target_died {
                                            let opponent_idx = 1 - player_idx;
                                            if let Some(dead_card) = game.opponent().field.get(t_idx) {
                                                collector.on_creature_died(dead_card, opponent_idx, Some(player_idx));
                                            }
                                        }
                                    } else {
                                        // Attack player
                                        collector.on_damage_dealt(damage, DamageTarget::Player, player_idx);
                                    }

                                    let _resolve = game.resolve_pending_attack(attack_cancelled);
                                }
                            }
                        }

                        collector.on_turn_end(game.current(), player_idx);
                        let _messages = game.end_turn();
                    }
                }

                GamePhase::EndPhase => {
                    let _messages = game.end_turn();
                }
            }

            // Check game over
            if game.is_game_over() {
                break;
            }
        }

        // Determine winner and condition
        let (winner, condition) = match &game.result {
            GameResult::Victory { winner, condition } => {
                let metric_condition = match condition {
                    VictoryCondition::Elimination => MetricVictoryCondition::Elimination,
                    VictoryCondition::Domination => MetricVictoryCondition::Domination,
                    VictoryCondition::TotalHarvest => MetricVictoryCondition::TotalHarvest,
                };
                (*winner as u8, metric_condition)
            }
            _ => {
                // Timed out or draw - determine winner by HP
                if game.players[0].hp > game.players[1].hp {
                    (0, MetricVictoryCondition::Elimination)
                } else {
                    (1, MetricVictoryCondition::Elimination)
                }
            }
        };

        collector.finalize(winner, condition, game.turn_number as u32, &game.players)
    }

    /// Get storage for analysis
    pub fn storage(&self) -> &MetricsStorage {
        &self.storage
    }

    /// Get mutable storage
    pub fn storage_mut(&mut self) -> &mut MetricsStorage {
        &mut self.storage
    }

    /// Save results to file
    pub fn save(&self, path: &str) -> Result<(), std::io::Error> {
        self.storage.save_to_file(path)
    }

    /// Export to CSV
    pub fn export_csv(&self, path: &str) -> Result<(), std::io::Error> {
        self.storage.export_csv(path)
    }
}

/// Quick simulation and report
pub fn quick_simulate(num_games: u32) {
    let config = SimulatorConfig {
        num_games,
        verbose: num_games <= 10,
        ..Default::default()
    };

    let mut simulator = Simulator::new(config);
    let results = simulator.run();

    Reporter::print_summary(&results);
    Reporter::print_card_analysis(&results);
    Reporter::print_alerts(&results);
}
