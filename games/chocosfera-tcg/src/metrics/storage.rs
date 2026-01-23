//! Storage for metrics data

use super::{CardMetrics, GameMetrics, MetricVictoryCondition, SimulatorResults, BalanceAlert};
use crate::cards_data::create_base_set;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};

/// Storage for game metrics
pub struct MetricsStorage {
    pub games: Vec<GameMetrics>,
    pub card_metrics: HashMap<String, CardMetrics>,
}

impl MetricsStorage {
    pub fn new() -> Self {
        // Initialize card metrics for all base cards
        let base_cards = create_base_set();
        let mut card_metrics = HashMap::new();

        for card in base_cards {
            card_metrics.insert(card.name.clone(), CardMetrics {
                card_name: card.name.clone(),
                card_type: format!("{:?}", card.card_type),
                ..Default::default()
            });
        }

        MetricsStorage {
            games: Vec::new(),
            card_metrics,
        }
    }

    /// Add a game's metrics to storage
    pub fn add_game(&mut self, metrics: GameMetrics) {
        let winner = metrics.winner as usize;
        let loser = 1 - winner;

        // Update card metrics from this game
        // For each card played, track if it was in winning/losing deck
        for card_name in self.card_metrics.keys().cloned().collect::<Vec<_>>() {
            let winner_played = metrics.player_metrics[winner]
                .keyword_activations
                .contains_key(&card_name);
            let loser_played = metrics.player_metrics[loser]
                .keyword_activations
                .contains_key(&card_name);

            if let Some(cm) = self.card_metrics.get_mut(&card_name) {
                if winner_played {
                    cm.times_in_winning_deck += 1;
                }
                if loser_played {
                    cm.times_in_losing_deck += 1;
                }
            }
        }

        self.games.push(metrics);
    }

    /// Analyze all games and generate results
    pub fn analyze(&mut self) -> SimulatorResults {
        if self.games.is_empty() {
            return SimulatorResults::default();
        }

        let total = self.games.len() as u32;
        let mut results = SimulatorResults {
            total_games: total,
            ..Default::default()
        };

        // Calculate averages
        let mut total_turns = 0u64;
        let mut total_duration = 0u64;
        let mut total_cards_played = 0u64;
        let mut total_reactions_used = 0u64;
        let mut total_reactions_unused = 0u64;
        let mut total_empty_turns = 0u64;
        let mut games_with_empty_turns = 0u32;
        let mut first_creature_turns = Vec::new();
        let mut player1_wins = 0u32;

        for game in &self.games {
            total_turns += game.total_turns as u64;
            total_duration += game.duration_ms;

            // Victory conditions
            match game.victory_condition {
                MetricVictoryCondition::Elimination => results.victories_by_elimination += 1,
                MetricVictoryCondition::Domination => results.victories_by_domination += 1,
                MetricVictoryCondition::TotalHarvest => results.victories_by_harvest += 1,
            }

            if game.winner == 0 {
                player1_wins += 1;
            }

            // Player metrics
            for pm in &game.player_metrics {
                total_cards_played += pm.cards_played as u64;
                total_reactions_used += pm.reactions_played as u64;
                total_reactions_unused += pm.reactions_in_hand_unused as u64;
                total_empty_turns += pm.empty_turns as u64;

                if pm.empty_turns > 0 {
                    games_with_empty_turns += 1;
                }

                if let Some(turn) = pm.first_creature_turn {
                    first_creature_turns.push(turn);
                }
            }
        }

        // Calculate final metrics
        results.avg_game_duration_turns = total_turns as f64 / total as f64;
        results.avg_game_duration_ms = total_duration as f64 / total as f64;
        results.player1_win_rate = player1_wins as f64 / total as f64;
        results.avg_cards_played_per_game = total_cards_played as f64 / total as f64;
        results.avg_reactions_used_per_game = total_reactions_used as f64 / total as f64;
        results.pct_games_with_empty_turns = games_with_empty_turns as f64 / (total * 2) as f64 * 100.0;
        results.avg_empty_turns_per_game = total_empty_turns as f64 / total as f64;

        let total_reactions = total_reactions_used + total_reactions_unused;
        if total_reactions > 0 {
            results.pct_reactions_unused = total_reactions_unused as f64 / total_reactions as f64 * 100.0;
        }

        if !first_creature_turns.is_empty() {
            results.avg_first_creature_turn =
                first_creature_turns.iter().sum::<u32>() as f64 / first_creature_turns.len() as f64;
        }

        // Calculate card metrics
        for cm in self.card_metrics.values_mut() {
            cm.calculate_win_rate();
        }

        // Top played cards
        let mut cards_by_played: Vec<_> = self.card_metrics.values()
            .filter(|c| c.times_played > 0)
            .map(|c| (c.card_name.clone(), c.times_played))
            .collect();
        cards_by_played.sort_by(|a, b| b.1.cmp(&a.1));
        results.most_played_cards = cards_by_played.into_iter().take(10).collect();

        // Highest win rate (min 10 games)
        let mut cards_by_winrate: Vec<_> = self.card_metrics.values()
            .filter(|c| c.times_in_winning_deck + c.times_in_losing_deck >= 10)
            .map(|c| (c.card_name.clone(), c.win_rate_when_played))
            .collect();
        cards_by_winrate.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        results.highest_win_rate_cards = cards_by_winrate.iter().take(5).cloned().collect();

        cards_by_winrate.reverse();
        results.lowest_win_rate_cards = cards_by_winrate.into_iter().take(5).collect();

        // Never played cards
        results.never_played_cards = self.card_metrics.values()
            .filter(|c| c.times_played == 0)
            .map(|c| c.card_name.clone())
            .collect();

        // Generate balance alerts
        results.balance_alerts = self.generate_alerts(&results);

        results
    }

    /// Generate balance alerts based on results
    fn generate_alerts(&self, results: &SimulatorResults) -> Vec<BalanceAlert> {
        let mut alerts = Vec::new();

        // Game duration
        if results.avg_game_duration_turns < 6.0 {
            alerts.push(BalanceAlert::GamesTooShort {
                avg_turns: results.avg_game_duration_turns,
            });
        } else if results.avg_game_duration_turns > 15.0 {
            alerts.push(BalanceAlert::GamesTooLong {
                avg_turns: results.avg_game_duration_turns,
            });
        }

        // Empty turns
        if results.pct_games_with_empty_turns > 10.0 {
            alerts.push(BalanceAlert::TooManyEmptyTurns {
                percentage: results.pct_games_with_empty_turns,
            });
        }

        // First creature timing
        if results.avg_first_creature_turn > 2.0 {
            alerts.push(BalanceAlert::FirstCreatureTooLate {
                avg_turn: results.avg_first_creature_turn,
            });
        }

        // Reactions unused
        if results.pct_reactions_unused > 50.0 {
            alerts.push(BalanceAlert::ReactionsUnused {
                percentage: results.pct_reactions_unused,
            });
        }

        // Victory condition dominance
        let total = results.total_games as f64;
        let elim_pct = results.victories_by_elimination as f64 / total * 100.0;
        let dom_pct = results.victories_by_domination as f64 / total * 100.0;
        let harvest_pct = results.victories_by_harvest as f64 / total * 100.0;

        if elim_pct > 80.0 {
            alerts.push(BalanceAlert::VictoryConditionDominates {
                condition: "Eliminación".to_string(),
                percentage: elim_pct,
            });
        }
        if dom_pct > 50.0 {
            alerts.push(BalanceAlert::VictoryConditionDominates {
                condition: "Dominación".to_string(),
                percentage: dom_pct,
            });
        }
        if harvest_pct > 40.0 {
            alerts.push(BalanceAlert::VictoryConditionDominates {
                condition: "Cosecha Total".to_string(),
                percentage: harvest_pct,
            });
        }

        // Card balance
        for cm in self.card_metrics.values() {
            let played = cm.times_in_winning_deck + cm.times_in_losing_deck;
            if played == 0 && results.total_games >= 100 {
                alerts.push(BalanceAlert::CardNeverPlayed {
                    card_name: cm.card_name.clone(),
                });
            } else if played >= 20 {
                if cm.win_rate_when_played > 0.70 {
                    alerts.push(BalanceAlert::CardOverpowered {
                        card_name: cm.card_name.clone(),
                        win_rate: cm.win_rate_when_played,
                    });
                } else if cm.win_rate_when_played < 0.30 {
                    alerts.push(BalanceAlert::CardUnderpowered {
                        card_name: cm.card_name.clone(),
                        win_rate: cm.win_rate_when_played,
                    });
                }
            }
        }

        alerts
    }

    /// Save metrics to JSON file
    pub fn save_to_file(&self, path: &str) -> Result<(), std::io::Error> {
        let file = File::create(path)?;
        let writer = BufWriter::new(file);
        serde_json::to_writer_pretty(writer, &self.games)?;
        Ok(())
    }

    /// Load metrics from JSON file
    pub fn load_from_file(path: &str) -> Result<Self, std::io::Error> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        let games: Vec<GameMetrics> = serde_json::from_reader(reader)?;

        let mut storage = Self::new();
        for game in games {
            storage.add_game(game);
        }
        Ok(storage)
    }

    /// Export to CSV for external analysis
    pub fn export_csv(&self, path: &str) -> Result<(), std::io::Error> {
        let mut file = File::create(path)?;

        // Header
        writeln!(file, "game_id,winner,victory_condition,total_turns,duration_ms,winner_hp,loser_hp")?;

        // Data
        for game in &self.games {
            writeln!(
                file,
                "{},{},{:?},{},{},{},{}",
                game.game_id,
                game.winner,
                game.victory_condition,
                game.total_turns,
                game.duration_ms,
                game.winner_hp,
                game.loser_hp
            )?;
        }

        Ok(())
    }
}

impl Default for MetricsStorage {
    fn default() -> Self {
        Self::new()
    }
}
