//! Metrics collector for tracking game events

use super::{GameMetrics, GameMode, MetricVictoryCondition, PlayerMetrics, TurnMetrics};
use crate::card::{Card, CardType, Keyword};
use crate::player::Player;
use chrono::Utc;
use std::collections::HashMap;
use std::time::Instant;

/// Target of damage for metrics
pub enum DamageTarget {
    Player,
    Creature,
}

/// Collects metrics during a game
pub struct MetricsCollector {
    game_id: u64,
    mode: GameMode,
    start_time: Instant,

    player_metrics: [PlayerMetrics; 2],
    turn_history: Vec<TurnMetrics>,
    current_turn: Option<TurnMetrics>,

    // Track cards played per turn for each card
    card_turn_played: HashMap<String, Vec<u32>>,
}

impl MetricsCollector {
    pub fn new(game_id: u64, mode: GameMode) -> Self {
        MetricsCollector {
            game_id,
            mode,
            start_time: Instant::now(),
            player_metrics: [PlayerMetrics::default(), PlayerMetrics::default()],
            turn_history: Vec::new(),
            current_turn: None,
            card_turn_played: HashMap::new(),
        }
    }

    /// Called at the start of each turn
    pub fn on_turn_start(&mut self, player: &Player, player_idx: u8, turn: u32) {
        self.current_turn = Some(TurnMetrics {
            turn_number: turn,
            player: player_idx,
            cacao_start: player.cacao,
            cacao_end: player.cacao,
            spirit_start: player.spirit,
            spirit_end: player.spirit,
            cards_in_hand_start: player.hand.len() as u32,
            cards_in_hand_end: player.hand.len() as u32,
            creatures_in_field: player.field.len() as u32,
            cards_played_this_turn: Vec::new(),
            damage_dealt_this_turn: 0,
            creatures_killed_this_turn: 0,
            was_empty_turn: true,
        });
    }

    /// Called at the end of each turn
    pub fn on_turn_end(&mut self, player: &Player, player_idx: u8) {
        if let Some(ref mut turn) = self.current_turn {
            turn.cacao_end = player.cacao;
            turn.spirit_end = player.spirit;
            turn.cards_in_hand_end = player.hand.len() as u32;
            turn.creatures_in_field = player.field.len() as u32;

            // Update max cacao
            let pm = &mut self.player_metrics[player_idx as usize];
            if player.cacao > pm.max_cacao_reached {
                pm.max_cacao_reached = player.cacao;
            }

            // Check for empty turn
            if turn.was_empty_turn {
                pm.empty_turns += 1;
            }

            self.turn_history.push(turn.clone());
        }
        self.current_turn = None;
    }

    /// Called when a card is played
    pub fn on_card_played(&mut self, card: &Card, player_idx: u8, turn: u32) {
        let pm = &mut self.player_metrics[player_idx as usize];
        pm.cards_played += 1;
        pm.total_cacao_spent += card.cacao_cost;

        match card.card_type {
            CardType::Guardian => {
                pm.guardians_played += 1;
                if pm.first_creature_turn.is_none() {
                    pm.first_creature_turn = Some(turn);
                }
            }
            CardType::Spirit => {
                pm.spirits_played += 1;
                if pm.first_creature_turn.is_none() {
                    pm.first_creature_turn = Some(turn);
                }
            }
            CardType::Resource => pm.resources_played += 1,
            CardType::Action => pm.actions_played += 1,
            CardType::Reaction => pm.reactions_played += 1,
            CardType::Place => pm.places_played += 1,
        }

        // Track which turn this card was played
        self.card_turn_played
            .entry(card.name.clone())
            .or_insert_with(Vec::new)
            .push(turn);

        // Update current turn
        if let Some(ref mut t) = self.current_turn {
            t.cards_played_this_turn.push(card.name.clone());
            t.was_empty_turn = false;
        }
    }

    /// Called when a card is drawn
    pub fn on_card_drawn(&mut self, player_idx: u8) {
        self.player_metrics[player_idx as usize].cards_drawn += 1;
    }

    /// Called when damage is dealt
    pub fn on_damage_dealt(&mut self, amount: i32, target: DamageTarget, player_idx: u8) {
        let pm = &mut self.player_metrics[player_idx as usize];
        pm.total_damage_dealt += amount;

        match target {
            DamageTarget::Player => pm.total_damage_to_player += amount,
            DamageTarget::Creature => pm.total_damage_to_creatures += amount,
        }

        if let Some(ref mut turn) = self.current_turn {
            turn.damage_dealt_this_turn += amount;
        }
    }

    /// Called when a creature dies
    pub fn on_creature_died(&mut self, _card: &Card, owner_idx: u8, killer_idx: Option<u8>) {
        self.player_metrics[owner_idx as usize].creatures_lost += 1;

        if let Some(killer) = killer_idx {
            self.player_metrics[killer as usize].creatures_killed += 1;

            if let Some(ref mut turn) = self.current_turn {
                if turn.player == killer {
                    turn.creatures_killed_this_turn += 1;
                }
            }
        }
    }

    /// Called when an ability is used
    pub fn on_ability_used(&mut self, _card: &Card, player_idx: u8, spirit_cost: i32) {
        let pm = &mut self.player_metrics[player_idx as usize];
        pm.abilities_used += 1;
        pm.total_spirit_used += spirit_cost;

        if let Some(ref mut turn) = self.current_turn {
            turn.was_empty_turn = false;
        }
    }

    /// Called when an ability is cancelled (by Contraflor)
    pub fn on_ability_cancelled(&mut self, target_player_idx: u8) {
        self.player_metrics[target_player_idx as usize].abilities_cancelled += 1;
    }

    /// Called when a reaction is triggered
    pub fn on_reaction_used(&mut self, _card: &Card, player_idx: u8) {
        self.player_metrics[player_idx as usize].reactions_played += 1;
    }

    /// Called when cacao is generated
    pub fn on_cacao_generated(&mut self, amount: i32, player_idx: u8) {
        self.player_metrics[player_idx as usize].total_cacao_generated += amount;
    }

    /// Called when a keyword ability triggers
    pub fn on_keyword_activated(&mut self, keyword: &Keyword, player_idx: u8) {
        let pm = &mut self.player_metrics[player_idx as usize];
        let keyword_name = format!("{:?}", keyword);
        *pm.keyword_activations.entry(keyword_name).or_insert(0) += 1;
    }

    /// Called at game end - finalizes and returns metrics
    pub fn finalize(
        mut self,
        winner_idx: u8,
        victory_condition: MetricVictoryCondition,
        total_turns: u32,
        players: &[Player; 2],
    ) -> GameMetrics {
        let duration_ms = self.start_time.elapsed().as_millis() as u64;
        let loser_idx = 1 - winner_idx as usize;

        // Count unused reactions
        for (idx, player) in players.iter().enumerate() {
            self.player_metrics[idx].reactions_in_hand_unused =
                player.reactions.len() as u32 +
                player.hand.iter().filter(|c| c.card_type == CardType::Reaction).count() as u32;
        }

        GameMetrics {
            game_id: self.game_id,
            timestamp: Utc::now().to_rfc3339(),
            mode: self.mode,
            winner: winner_idx,
            victory_condition,
            total_turns,
            duration_ms,
            winner_hp: players[winner_idx as usize].hp,
            loser_hp: players[loser_idx].hp,
            winner_cacao: players[winner_idx as usize].cacao,
            winner_creatures: players[winner_idx as usize].field.len() as u32,
            winner_cards_in_hand: players[winner_idx as usize].hand.len() as u32,
            player_metrics: self.player_metrics,
        }
    }

    /// Get turn history for analysis
    pub fn get_turn_history(&self) -> &[TurnMetrics] {
        &self.turn_history
    }

    /// Get card play statistics
    pub fn get_card_turn_data(&self) -> &HashMap<String, Vec<u32>> {
        &self.card_turn_played
    }
}
