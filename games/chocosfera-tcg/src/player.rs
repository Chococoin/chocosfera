//! Player state and management for Chocósfera TCG

use crate::card::{Card, CardType};
use crate::cards_data::create_base_set;
use rand::seq::SliceRandom;
use rand::thread_rng;

/// A player in the game
#[derive(Clone, Debug)]
pub struct Player {
    pub name: String,
    pub is_human: bool,

    // Victory conditions
    pub hp: i32,
    pub total_cacao_harvested: i32,

    // Resources
    pub cacao: i32,
    pub spirit: i32,
    pub max_spirit: i32,

    // Card zones
    pub hand: Vec<Card>,
    pub deck: Vec<Card>,
    pub field: Vec<Card>,        // Guardians and Spirits in play
    pub place: Option<Card>,      // Current Place card
    pub reactions: Vec<Card>,     // Reaction cards set aside
    pub discard: Vec<Card>,
}

impl Player {
    pub fn new(name: &str, is_human: bool) -> Self {
        Player {
            name: name.to_string(),
            is_human,
            hp: 20,
            total_cacao_harvested: 0,
            cacao: 3,  // Starting cacao to play cards turn 1
            spirit: 0,
            max_spirit: 0,
            hand: Vec::new(),
            deck: Vec::new(),
            field: Vec::new(),
            place: None,
            reactions: Vec::new(),
            discard: Vec::new(),
        }
    }

    /// Create a starter deck with the base set
    pub fn create_starter_deck(&mut self) {
        let base_cards = create_base_set();

        // For a starter deck, include 2 copies of each card (48 cards total)
        // In a real game, you'd have deck building rules
        for card in base_cards.iter() {
            self.deck.push(card.clone());
            self.deck.push(card.clone());
        }

        self.shuffle_deck();
    }

    /// Shuffle the deck
    pub fn shuffle_deck(&mut self) {
        let mut rng = thread_rng();
        self.deck.shuffle(&mut rng);
    }

    /// Draw cards from deck to hand
    pub fn draw_cards(&mut self, count: usize) -> usize {
        let mut drawn = 0;
        for _ in 0..count {
            if let Some(card) = self.deck.pop() {
                self.hand.push(card);
                drawn += 1;
            }
        }
        drawn
    }

    /// Update spirit at the start of turn
    pub fn update_spirit(&mut self, turn_number: i32) {
        // Max spirit grows with turn number, caps at 5
        self.max_spirit = std::cmp::min(turn_number, 5);
        // Regenerate spirit to max
        self.spirit = self.max_spirit;
    }

    /// Produce cacao from all Guardians
    pub fn produce_cacao(&mut self, place_bonus: i32) -> i32 {
        let mut total = 0;
        for card in &self.field {
            if card.card_type == CardType::Guardian {
                let production = card.get_production() + place_bonus;
                total += production;
            }
        }
        self.cacao += total;
        total
    }

    /// Check if player can pay cacao cost
    pub fn can_pay_cacao(&self, cost: i32) -> bool {
        self.cacao >= cost
    }

    /// Pay cacao cost
    pub fn pay_cacao(&mut self, cost: i32) -> bool {
        if self.can_pay_cacao(cost) {
            self.cacao -= cost;
            true
        } else {
            false
        }
    }

    /// Check if player can pay spirit cost
    pub fn can_pay_spirit(&self, cost: i32) -> bool {
        self.spirit >= cost
    }

    /// Pay spirit cost
    pub fn pay_spirit(&mut self, cost: i32) -> bool {
        if self.can_pay_spirit(cost) {
            self.spirit -= cost;
            true
        } else {
            false
        }
    }

    /// Play a card from hand to field
    pub fn play_card(&mut self, hand_index: usize) -> Option<Card> {
        if hand_index >= self.hand.len() {
            return None;
        }

        let card = &self.hand[hand_index];
        if !self.can_pay_cacao(card.cacao_cost) {
            return None;
        }

        let cost = card.cacao_cost;
        self.pay_cacao(cost);

        let mut card = self.hand.remove(hand_index);

        match card.card_type {
            CardType::Guardian | CardType::Spirit => {
                card.can_attack = false; // Summoning sickness
                self.field.push(card.clone());
                Some(card)
            }
            CardType::Place => {
                // Replace existing place
                if let Some(old_place) = self.place.take() {
                    self.discard.push(old_place);
                }
                self.place = Some(card.clone());
                Some(card)
            }
            CardType::Reaction => {
                // Reactions go to reaction zone
                self.reactions.push(card.clone());
                Some(card)
            }
            CardType::Resource | CardType::Action => {
                // These go to discard after use
                self.discard.push(card.clone());
                Some(card)
            }
        }
    }

    /// Count Guardians on field
    pub fn count_guardians(&self) -> usize {
        self.field.iter().filter(|c| c.card_type == CardType::Guardian).count()
    }

    /// Count all creatures on field
    pub fn count_creatures(&self) -> usize {
        self.field.iter().filter(|c| c.is_creature()).count()
    }

    /// Remove a creature from field by index
    pub fn remove_creature(&mut self, index: usize) -> Option<Card> {
        if index < self.field.len() {
            let card = self.field.remove(index);
            self.discard.push(card.clone());
            Some(card)
        } else {
            None
        }
    }

    /// Get creatures sorted by speed (highest first for attack order)
    pub fn get_creatures_by_speed(&self) -> Vec<(usize, &Card)> {
        let mut creatures: Vec<(usize, &Card)> = self.field
            .iter()
            .enumerate()
            .filter(|(_, c)| c.is_creature())
            .collect();

        creatures.sort_by(|a, b| b.1.get_speed().cmp(&a.1.get_speed()));
        creatures
    }

    /// Reset all creatures for new turn
    pub fn reset_creatures_for_turn(&mut self) {
        for card in &mut self.field {
            card.can_attack = true;
            card.reset_turn_buffs();
        }
    }

    /// Apply poison to all poisoned creatures, returns indices of dead creatures
    pub fn apply_poison_damage(&mut self) -> Vec<usize> {
        let mut dead_indices = Vec::new();
        for (i, card) in self.field.iter_mut().enumerate() {
            if card.apply_poison() {
                dead_indices.push(i);
            }
        }
        dead_indices.reverse(); // Remove from end first
        dead_indices
    }

    /// Take direct damage to HP
    pub fn take_damage(&mut self, damage: i32) {
        self.hp -= damage;
    }

    /// Check if player has lost (HP <= 0)
    pub fn is_eliminated(&self) -> bool {
        self.hp <= 0
    }

    /// Check if player has achieved domination (3+ Guardians)
    pub fn has_domination(&self) -> bool {
        self.count_guardians() >= 3
    }

    /// Check if player has achieved total harvest (20+ cacao harvested)
    pub fn has_total_harvest(&self) -> bool {
        self.total_cacao_harvested >= 20
    }

    /// Add cacao to harvest total (for victory tracking)
    pub fn harvest_cacao(&mut self, amount: i32) {
        self.total_cacao_harvested += amount;
    }

    /// Get available reactions for a trigger
    pub fn get_available_reactions(&self, trigger: &crate::card::ReactionTrigger) -> Vec<(usize, &Card)> {
        self.reactions
            .iter()
            .enumerate()
            .filter(|(_, c)| {
                c.reaction_trigger.as_ref() == Some(trigger)
                    && c.spirit_cost.map(|cost| self.spirit >= cost).unwrap_or(true)
            })
            .collect()
    }

    /// Use a reaction card
    pub fn use_reaction(&mut self, index: usize) -> Option<Card> {
        if index >= self.reactions.len() {
            return None;
        }

        let card = &self.reactions[index];
        if let Some(cost) = card.spirit_cost {
            if !self.can_pay_spirit(cost) {
                return None;
            }
            self.pay_spirit(cost);
        }

        let card = self.reactions.remove(index);
        self.discard.push(card.clone());
        Some(card)
    }
}
