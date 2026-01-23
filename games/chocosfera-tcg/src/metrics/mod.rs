//! Metrics collection and analysis for Chocósfera TCG
//! Used for balance analysis and automated testing

pub mod collector;
pub mod storage;
pub mod reporter;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Game mode for metrics tracking
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum GameMode {
    PvP,
    PvAI,
    AIvAI,
}

/// Victory condition achieved
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum MetricVictoryCondition {
    Elimination,
    Domination,
    TotalHarvest,
}

/// Complete metrics for a single game
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GameMetrics {
    // Identification
    pub game_id: u64,
    pub timestamp: String,
    pub mode: GameMode,

    // Result
    pub winner: u8,  // 0 or 1
    pub victory_condition: MetricVictoryCondition,
    pub total_turns: u32,
    pub duration_ms: u64,

    // Final state
    pub winner_hp: i32,
    pub loser_hp: i32,
    pub winner_cacao: i32,
    pub winner_creatures: u32,
    pub winner_cards_in_hand: u32,

    // Per-player metrics
    pub player_metrics: [PlayerMetrics; 2],
}

/// Metrics for a single player in a game
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct PlayerMetrics {
    // Resources
    pub total_cacao_generated: i32,
    pub total_cacao_spent: i32,
    pub total_spirit_used: i32,
    pub max_cacao_reached: i32,

    // Cards
    pub cards_played: u32,
    pub cards_drawn: u32,
    pub guardians_played: u32,
    pub spirits_played: u32,
    pub resources_played: u32,
    pub actions_played: u32,
    pub reactions_played: u32,
    pub reactions_in_hand_unused: u32,
    pub places_played: u32,

    // Combat
    pub total_damage_dealt: i32,
    pub total_damage_to_player: i32,
    pub total_damage_to_creatures: i32,
    pub creatures_killed: u32,
    pub creatures_lost: u32,

    // Abilities
    pub abilities_used: u32,
    pub abilities_cancelled: u32,

    // Turns
    pub empty_turns: u32,
    pub first_creature_turn: Option<u32>,

    // Keyword activations
    pub keyword_activations: HashMap<String, u32>,
}

/// Metrics for a single turn
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TurnMetrics {
    pub turn_number: u32,
    pub player: u8,
    pub cacao_start: i32,
    pub cacao_end: i32,
    pub spirit_start: i32,
    pub spirit_end: i32,
    pub cards_in_hand_start: u32,
    pub cards_in_hand_end: u32,
    pub creatures_in_field: u32,
    pub cards_played_this_turn: Vec<String>,
    pub damage_dealt_this_turn: i32,
    pub creatures_killed_this_turn: u32,
    pub was_empty_turn: bool,
}

/// Aggregate metrics for a specific card
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct CardMetrics {
    pub card_name: String,
    pub card_type: String,
    pub times_played: u32,
    pub times_in_winning_deck: u32,
    pub times_in_losing_deck: u32,
    pub win_rate_when_played: f64,
    pub average_turn_played: f64,
    pub times_ability_used: u32,
    pub total_damage_dealt: i32,
    pub times_killed_enemy: u32,
    pub times_died: u32,
    pub total_lifespan_turns: u32,
    pub times_lived: u32,
}

impl CardMetrics {
    pub fn average_lifespan(&self) -> f64 {
        if self.times_lived > 0 {
            self.total_lifespan_turns as f64 / self.times_lived as f64
        } else {
            0.0
        }
    }

    pub fn calculate_win_rate(&mut self) {
        let total = self.times_in_winning_deck + self.times_in_losing_deck;
        if total > 0 {
            self.win_rate_when_played = self.times_in_winning_deck as f64 / total as f64;
        }
    }
}

/// Balance alerts detected during analysis
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum BalanceAlert {
    GamesTooShort { avg_turns: f64 },
    GamesTooLong { avg_turns: f64 },
    TooManyEmptyTurns { percentage: f64 },
    CardNeverPlayed { card_name: String },
    CardOverpowered { card_name: String, win_rate: f64 },
    CardUnderpowered { card_name: String, win_rate: f64 },
    VictoryConditionDominates { condition: String, percentage: f64 },
    ReactionsUnused { percentage: f64 },
    FirstCreatureTooLate { avg_turn: f64 },
}

impl std::fmt::Display for BalanceAlert {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BalanceAlert::GamesTooShort { avg_turns } =>
                write!(f, "Partidas muy cortas: {:.1} turnos promedio (ideal: 8-12)", avg_turns),
            BalanceAlert::GamesTooLong { avg_turns } =>
                write!(f, "Partidas muy largas: {:.1} turnos promedio (ideal: 8-12)", avg_turns),
            BalanceAlert::TooManyEmptyTurns { percentage } =>
                write!(f, "Muchos turnos vacíos: {:.1}% (máximo: 10%)", percentage),
            BalanceAlert::CardNeverPlayed { card_name } =>
                write!(f, "Carta nunca jugada: {}", card_name),
            BalanceAlert::CardOverpowered { card_name, win_rate } =>
                write!(f, "Carta posiblemente OP: {} ({:.1}% win rate)", card_name, win_rate * 100.0),
            BalanceAlert::CardUnderpowered { card_name, win_rate } =>
                write!(f, "Carta posiblemente débil: {} ({:.1}% win rate)", card_name, win_rate * 100.0),
            BalanceAlert::VictoryConditionDominates { condition, percentage } =>
                write!(f, "Condición de victoria dominante: {} ({:.1}%)", condition, percentage),
            BalanceAlert::ReactionsUnused { percentage } =>
                write!(f, "Reacciones sin usar: {:.1}% (máximo: 50%)", percentage),
            BalanceAlert::FirstCreatureTooLate { avg_turn } =>
                write!(f, "Primera criatura muy tarde: turno {:.1} (ideal: 1-2)", avg_turn),
        }
    }
}

/// Results from running simulations
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SimulatorResults {
    pub total_games: u32,
    pub avg_game_duration_turns: f64,
    pub avg_game_duration_ms: f64,

    // Victory conditions
    pub victories_by_elimination: u32,
    pub victories_by_domination: u32,
    pub victories_by_harvest: u32,
    pub player1_win_rate: f64,

    // Balance metrics
    pub avg_first_creature_turn: f64,
    pub pct_games_with_empty_turns: f64,
    pub avg_empty_turns_per_game: f64,
    pub avg_cards_played_per_game: f64,
    pub avg_reactions_used_per_game: f64,
    pub pct_reactions_unused: f64,

    // Card rankings
    pub most_played_cards: Vec<(String, u32)>,
    pub highest_win_rate_cards: Vec<(String, f64)>,
    pub lowest_win_rate_cards: Vec<(String, f64)>,
    pub never_played_cards: Vec<String>,

    // Alerts
    pub balance_alerts: Vec<BalanceAlert>,
}

impl Default for SimulatorResults {
    fn default() -> Self {
        SimulatorResults {
            total_games: 0,
            avg_game_duration_turns: 0.0,
            avg_game_duration_ms: 0.0,
            victories_by_elimination: 0,
            victories_by_domination: 0,
            victories_by_harvest: 0,
            player1_win_rate: 0.0,
            avg_first_creature_turn: 0.0,
            pct_games_with_empty_turns: 0.0,
            avg_empty_turns_per_game: 0.0,
            avg_cards_played_per_game: 0.0,
            avg_reactions_used_per_game: 0.0,
            pct_reactions_unused: 0.0,
            most_played_cards: Vec::new(),
            highest_win_rate_cards: Vec::new(),
            lowest_win_rate_cards: Vec::new(),
            never_played_cards: Vec::new(),
            balance_alerts: Vec::new(),
        }
    }
}
