//! Basic AI opponent for Chocósfera TCG

use crate::card::{CardType, Keyword};
use crate::game::Game;
use rand::Rng;

/// AI decision for what action to take
#[derive(Debug)]
pub enum AIAction {
    PlayCard(usize),
    UseAbility(usize),
    Attack(usize, Option<usize>),
    EndPhase,
}

/// Basic AI that makes reasonable decisions
pub struct AI;

impl AI {
    /// Decide what to do in the main phase
    pub fn decide_main_phase(game: &Game) -> AIAction {
        let player = game.current();
        let mut rng = rand::thread_rng();

        // Priority 1: Play creatures if we have cacao
        for (i, card) in player.hand.iter().enumerate() {
            if player.can_pay_cacao(card.cacao_cost) {
                match card.card_type {
                    CardType::Guardian => {
                        // Always play Guardians
                        return AIAction::PlayCard(i);
                    }
                    CardType::Spirit => {
                        // Play spirits if we have less than 3 creatures
                        if player.count_creatures() < 3 {
                            return AIAction::PlayCard(i);
                        }
                    }
                    CardType::Resource => {
                        // Play resources for more cacao
                        return AIAction::PlayCard(i);
                    }
                    _ => {}
                }
            }
        }

        // Priority 2: Use abilities if we have spirit
        for (i, card) in player.field.iter().enumerate() {
            if let Some(ref ability) = card.ability {
                if !card.ability_used && player.can_pay_spirit(ability.spirit_cost) {
                    // 50% chance to use ability
                    if rng.gen_bool(0.5) {
                        return AIAction::UseAbility(i);
                    }
                }
            }
        }

        // Priority 3: Play action cards
        for (i, card) in player.hand.iter().enumerate() {
            if card.card_type == CardType::Action && player.can_pay_cacao(card.cacao_cost) {
                return AIAction::PlayCard(i);
            }
        }

        // Priority 4: Play place cards
        for (i, card) in player.hand.iter().enumerate() {
            if card.card_type == CardType::Place && player.can_pay_cacao(card.cacao_cost) && player.place.is_none() {
                return AIAction::PlayCard(i);
            }
        }

        // Priority 5: Set up reactions
        for (i, card) in player.hand.iter().enumerate() {
            if card.card_type == CardType::Reaction && player.can_pay_cacao(card.cacao_cost) {
                if player.reactions.len() < 2 {
                    return AIAction::PlayCard(i);
                }
            }
        }

        AIAction::EndPhase
    }

    /// Decide attacks in combat phase
    pub fn decide_combat(game: &Game) -> Vec<(usize, Option<usize>)> {
        let player = game.current();
        let opponent = game.opponent();
        let mut attacks = Vec::new();

        // Get creatures that can attack, sorted by speed
        let attackers: Vec<(usize, i32, bool)> = player.field.iter()
            .enumerate()
            .filter_map(|(i, c)| {
                if c.is_creature() && c.can_attack && c.get_strength() > 0 {
                    Some((i, c.get_strength(), c.keyword == Some(Keyword::Perforar)))
                } else {
                    None
                }
            })
            .collect();

        // Get valid targets
        let targets: Vec<(usize, i32)> = opponent.field.iter()
            .enumerate()
            .filter_map(|(i, c)| {
                if c.is_creature() {
                    Some((i, c.get_current_hp()))
                } else {
                    None
                }
            })
            .collect();

        for (attacker_idx, strength, has_pierce) in attackers {
            // Strategy: attack creatures we can kill, otherwise attack player

            // Find a creature we can kill
            let killable_target = targets.iter()
                .find(|(_, hp)| *hp <= strength);

            if let Some((target_idx, _)) = killable_target {
                attacks.push((attacker_idx, Some(*target_idx)));
            } else if targets.is_empty() || has_pierce {
                // No targets or we have pierce - attack player
                attacks.push((attacker_idx, None));
            } else {
                // Attack the weakest creature
                if let Some((target_idx, _)) = targets.iter().min_by_key(|(_, hp)| hp) {
                    attacks.push((attacker_idx, Some(*target_idx)));
                }
            }
        }

        attacks
    }

    /// Decide whether to use a reaction
    pub fn should_use_reaction(game: &Game, reaction_index: usize) -> bool {
        let player = game.opponent(); // AI is the opponent during reaction window
        let reaction = &player.reactions[reaction_index];
        let mut rng = rand::thread_rng();

        // Check if we can afford it
        if let Some(cost) = reaction.spirit_cost {
            if !player.can_pay_spirit(cost) {
                return false;
            }
        }

        // Use reactions based on name
        match reaction.name.as_str() {
            "Niebla" => {
                // Use to cancel strong attacks
                if let Some(pending) = game.pending_attacks.last() {
                    pending.damage >= 3 || pending.target_index.is_none()
                } else {
                    false
                }
            }
            "Espinas" => {
                // Use when taking damage
                rng.gen_bool(0.7)
            }
            "Raíz Oculta" => {
                // Save for when a creature dies
                true
            }
            "Contraflor" => {
                // Counter powerful abilities
                rng.gen_bool(0.5)
            }
            _ => rng.gen_bool(0.5)
        }
    }

    /// Choose a target for abilities that need one
    pub fn choose_ability_target(game: &Game, ability_name: &str) -> Option<usize> {
        let player = game.current();
        let opponent = game.opponent();

        match ability_name {
            "Nutrir" | "Impulso" | "Sanar" => {
                // Target our weakest creature
                player.field.iter()
                    .enumerate()
                    .filter(|(_, c)| c.is_creature())
                    .min_by_key(|(_, c)| c.get_current_hp())
                    .map(|(i, _)| i)
            }
            "Punzar" | "Quemar" => {
                // Target enemy's strongest creature
                opponent.field.iter()
                    .enumerate()
                    .filter(|(_, c)| c.is_creature())
                    .max_by_key(|(_, c)| c.get_strength())
                    .map(|(i, _)| i)
            }
            "Copiar" => {
                // Copy the best ability
                player.field.iter()
                    .enumerate()
                    .filter(|(_, c)| c.ability.is_some() && !c.ability_used)
                    .next()
                    .map(|(i, _)| i)
            }
            _ => None
        }
    }
}
