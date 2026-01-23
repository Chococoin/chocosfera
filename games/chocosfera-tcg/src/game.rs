//! Game state and turn management for Chocósfera TCG

use crate::card::{Card, CardType, Keyword};
use crate::player::Player;

/// Game phases within a turn
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum GamePhase {
    /// Start of turn: draw card, update spirit, apply poison
    StartPhase,
    /// Production: Guardians produce cacao
    ProductionPhase,
    /// Main phase: play cards, use abilities
    MainPhase,
    /// Combat: creatures attack by speed order
    CombatPhase,
    /// End phase: cleanup, check victory
    EndPhase,
}

impl std::fmt::Display for GamePhase {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            GamePhase::StartPhase => write!(f, "🌅 Fase de Inicio"),
            GamePhase::ProductionPhase => write!(f, "🫘 Fase de Producción"),
            GamePhase::MainPhase => write!(f, "🎴 Fase Principal"),
            GamePhase::CombatPhase => write!(f, "⚔️ Fase de Combate"),
            GamePhase::EndPhase => write!(f, "🌙 Fase de Fin"),
        }
    }
}

/// Victory condition achieved
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum VictoryCondition {
    /// Opponent HP reduced to 0
    Elimination,
    /// Control 3+ Guardians at end of turn
    Domination,
    /// Harvested 20+ cacao total
    TotalHarvest,
}

impl std::fmt::Display for VictoryCondition {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VictoryCondition::Elimination => write!(f, "💀 Eliminación"),
            VictoryCondition::Domination => write!(f, "👑 Dominación"),
            VictoryCondition::TotalHarvest => write!(f, "🫘 Cosecha Total"),
        }
    }
}

/// Game result
#[derive(Clone, Debug)]
pub enum GameResult {
    InProgress,
    Victory { winner: usize, condition: VictoryCondition },
    Draw,
}

/// Main game state
pub struct Game {
    pub players: [Player; 2],
    pub current_player: usize,
    pub turn_number: i32,
    pub phase: GamePhase,
    pub result: GameResult,

    // Combat tracking
    pub pending_attacks: Vec<PendingAttack>,
    pub reaction_window_open: bool,
}

/// A pending attack waiting for reaction
#[derive(Clone, Debug)]
pub struct PendingAttack {
    pub attacker_player: usize,
    pub attacker_index: usize,
    pub target_player: usize,
    pub target_index: Option<usize>, // None = direct attack to player
    pub damage: i32,
    pub has_pierce: bool,
}

impl Game {
    pub fn new(player1_name: &str, player2_name: &str, player2_is_ai: bool) -> Self {
        let mut player1 = Player::new(player1_name, true);
        let mut player2 = Player::new(player2_name, !player2_is_ai);

        // Create starter decks
        player1.create_starter_deck();
        player2.create_starter_deck();

        // Draw starting hands (5 cards each)
        player1.draw_cards(5);
        player2.draw_cards(5);

        Game {
            players: [player1, player2],
            current_player: 0,
            turn_number: 1,
            phase: GamePhase::StartPhase,
            result: GameResult::InProgress,
            pending_attacks: Vec::new(),
            reaction_window_open: false,
        }
    }

    /// Get current player
    pub fn current(&self) -> &Player {
        &self.players[self.current_player]
    }

    /// Get current player mutably
    pub fn current_mut(&mut self) -> &mut Player {
        &mut self.players[self.current_player]
    }

    /// Get opponent
    pub fn opponent(&self) -> &Player {
        &self.players[1 - self.current_player]
    }

    /// Get opponent mutably
    pub fn opponent_mut(&mut self) -> &mut Player {
        &mut self.players[1 - self.current_player]
    }

    /// Get opponent index
    pub fn opponent_index(&self) -> usize {
        1 - self.current_player
    }

    /// Start a new turn
    pub fn start_turn(&mut self) -> Vec<String> {
        let mut messages = Vec::new();

        // Update spirit for current player
        let turn = self.turn_number;
        self.current_mut().update_spirit(turn);
        messages.push(format!(
            "✨ Espíritu regenerado: {}/{}",
            self.current().spirit,
            self.current().max_spirit
        ));

        // Draw a card
        if self.current_mut().draw_cards(1) > 0 {
            messages.push("📥 Robaste 1 carta".to_string());
        } else {
            messages.push("⚠️ ¡Mazo vacío!".to_string());
        }

        // Apply poison to current player's creatures
        let dead = self.current_mut().apply_poison_damage();
        for idx in dead {
            if let Some(card) = self.current_mut().remove_creature(idx) {
                messages.push(format!("☠️ {} murió por veneno", card.name));
            }
        }

        // Reset creatures for new turn
        self.current_mut().reset_creatures_for_turn();

        // Check for Río Antiguo (extra card draw)
        if let Some(ref place) = self.current().place {
            if place.name == "Río Antiguo" {
                self.current_mut().draw_cards(1);
                messages.push("🌊 Río Antiguo: +1 carta".to_string());
            }
        }

        self.phase = GamePhase::ProductionPhase;
        messages
    }

    /// Production phase
    pub fn production_phase(&mut self) -> Vec<String> {
        let mut messages = Vec::new();

        // Check for place bonus
        let place_bonus = if let Some(ref place) = self.current().place {
            if place.name == "Claro del Bosque" { 1 } else { 0 }
        } else {
            0
        };

        let produced = self.current_mut().produce_cacao(place_bonus);
        if produced > 0 {
            messages.push(format!("🫘 Producción: +{} cacao (Total: {})", produced, self.current().cacao));
        }

        self.phase = GamePhase::MainPhase;
        messages
    }

    /// Play a card from hand
    pub fn play_card(&mut self, hand_index: usize) -> Result<Vec<String>, String> {
        if self.phase != GamePhase::MainPhase {
            return Err("Solo puedes jugar cartas en la Fase Principal".to_string());
        }

        let card = self.current().hand.get(hand_index)
            .ok_or("Índice de carta inválido")?
            .clone();

        if !self.current().can_pay_cacao(card.cacao_cost) {
            return Err(format!("No tienes suficiente cacao (necesitas {})", card.cacao_cost));
        }

        let mut messages = Vec::new();

        // Play the card
        if let Some(played_card) = self.current_mut().play_card(hand_index) {
            messages.push(format!("🎴 Jugaste: {} (Costo: {} cacao)", played_card.name, played_card.cacao_cost));

            // Handle entry effects
            messages.extend(self.handle_card_effects(&played_card));
        }

        Ok(messages)
    }

    /// Handle card effects when played
    fn handle_card_effects(&mut self, card: &Card) -> Vec<String> {
        let mut messages = Vec::new();

        match card.card_type {
            CardType::Guardian | CardType::Spirit => {
                // Check for Floración keyword
                if card.keyword == Some(Keyword::Floracion) {
                    if let Some(ref effect) = card.effect {
                        messages.push(format!("🌸 Floración: {}", effect));
                        // Brote gives +1 cacao on entry
                        if card.name == "Brote" {
                            self.current_mut().cacao += 1;
                        }
                    }
                }
            }
            CardType::Resource => {
                messages.extend(self.apply_resource_effect(card));
            }
            CardType::Action => {
                messages.extend(self.apply_action_effect(card));
            }
            CardType::Place => {
                messages.push(format!("🏞️ Lugar activo: {}", card.name));
            }
            CardType::Reaction => {
                messages.push(format!("🛡️ Reacción preparada: {}", card.name));
            }
        }

        messages
    }

    /// Apply resource card effect
    fn apply_resource_effect(&mut self, card: &Card) -> Vec<String> {
        let mut messages = Vec::new();

        match card.name.as_str() {
            "Grano de Cacao" => {
                self.current_mut().cacao += 2;
                messages.push("🫘 +2 cacao".to_string());
            }
            "Lluvia" => {
                self.current_mut().cacao += 1;
                self.current_mut().draw_cards(1);
                messages.push("🌧️ +1 cacao, +1 carta".to_string());
            }
            "Sol" => {
                let bonus = self.current().count_guardians() as i32;
                self.current_mut().cacao += bonus;
                messages.push(format!("☀️ +{} cacao (1 por Guardián)", bonus));
            }
            "Abono" => {
                self.current_mut().cacao += 4;
                messages.push("🌱 +4 cacao".to_string());
            }
            _ => {}
        }

        messages
    }

    /// Apply action card effect
    fn apply_action_effect(&mut self, card: &Card) -> Vec<String> {
        let mut messages = Vec::new();

        match card.name.as_str() {
            "Cosecha Dorada" => {
                self.current_mut().cacao += 3;
                messages.push("🌾 +3 cacao".to_string());
            }
            "Tormenta" => {
                let opponent_idx = self.opponent_index();
                let mut dead_indices = Vec::new();

                for (i, creature) in self.players[opponent_idx].field.iter_mut().enumerate() {
                    if creature.is_creature() {
                        if creature.take_damage(2, false) {
                            dead_indices.push(i);
                        }
                    }
                }

                messages.push(format!("⛈️ Tormenta: 2 daño a todas las criaturas enemigas"));

                dead_indices.reverse();
                for idx in dead_indices {
                    if let Some(dead) = self.players[opponent_idx].remove_creature(idx) {
                        messages.push(format!("☠️ {} destruido", dead.name));
                    }
                }
            }
            "Poda" => {
                messages.push("✂️ Poda: Selecciona un Espíritu enemigo para destruir".to_string());
                // This needs UI interaction, handled separately
            }
            "Injerto" => {
                messages.push("🔀 Injerto: Copia stats de un Guardián enemigo".to_string());
                // This needs UI interaction, handled separately
            }
            _ => {}
        }

        messages
    }

    /// Use a creature's ability
    pub fn use_ability(&mut self, creature_index: usize) -> Result<Vec<String>, String> {
        if self.phase != GamePhase::MainPhase {
            return Err("Solo puedes usar habilidades en la Fase Principal".to_string());
        }

        // First, validate and gather all the info we need
        let creature = self.current().field.get(creature_index)
            .ok_or("Criatura no encontrada")?;

        if creature.ability_used {
            return Err("Esta criatura ya usó su habilidad este turno".to_string());
        }

        let ability = creature.ability.as_ref()
            .ok_or("Esta criatura no tiene habilidad")?
            .clone();

        let creature_name = creature.name.clone();
        let creature_keyword = creature.keyword.clone();

        if !self.current().can_pay_spirit(ability.spirit_cost) {
            return Err(format!("No tienes suficiente espíritu (necesitas {})", ability.spirit_cost));
        }

        // Pay cost
        self.current_mut().pay_spirit(ability.spirit_cost);
        self.current_mut().field[creature_index].ability_used = true;

        let mut messages = Vec::new();
        messages.push(format!("✨ {}: {} (Costo: {} espíritu)",
            creature_name, ability.name, ability.spirit_cost));

        // Check for Polinización keyword
        if creature_keyword == Some(Keyword::Polinizacion) {
            for c in &mut self.current_mut().field {
                if c.is_creature() {
                    c.temp_resistance_buff += 1;
                }
            }
            messages.push("🌺 Polinización: Todos los aliados +1🛡️".to_string());
        }

        // Handle specific abilities
        let ability_name = ability.name.clone();
        messages.extend(self.apply_ability_effect(&ability_name));

        Ok(messages)
    }

    /// Apply ability effect
    fn apply_ability_effect(&mut self, ability_name: &str) -> Vec<String> {
        let mut messages = Vec::new();

        match ability_name {
            "Germinar" => {
                self.current_mut().cacao += 1;
                messages.push("🌱 +1 cacao".to_string());
            }
            "Endurecer" => {
                // Find the creature that used the ability (most recent)
                if let Some(c) = self.current_mut().field.iter_mut()
                    .find(|c| c.ability.as_ref().map(|a| a.name == "Endurecer").unwrap_or(false)) {
                    c.temp_resistance_buff += 2;
                }
                messages.push("🛡️ +2 resistencia este turno".to_string());
            }
            "Nutrir" => {
                messages.push("🌿 Selecciona un aliado para +1💪 +1🛡️".to_string());
            }
            "Punzar" => {
                messages.push("🗡️ Selecciona un objetivo para 1 daño directo".to_string());
            }
            "Eclipse" => {
                for c in &mut self.opponent_mut().field {
                    if c.is_creature() {
                        c.temp_strength_buff -= 1;
                    }
                }
                messages.push("🌑 Todos los enemigos -1💪 este turno".to_string());
            }
            "Madurar" => {
                self.current_mut().cacao += 2;
                self.current_mut().draw_cards(1);
                messages.push("🍎 +2 cacao, +1 carta".to_string());
            }
            "Impulso" => {
                messages.push("💨 Selecciona un aliado para +2💪 este turno".to_string());
            }
            "Sanar" => {
                messages.push("💧 Selecciona un aliado para +2🛡️".to_string());
            }
            "Quemar" => {
                messages.push("🔥 Selecciona un enemigo para 1 daño + Veneno".to_string());
            }
            "Copiar" => {
                messages.push("🔄 Selecciona una habilidad aliada para copiar".to_string());
            }
            _ => {}
        }

        messages
    }

    /// Move to combat phase
    pub fn start_combat(&mut self) -> Vec<String> {
        self.phase = GamePhase::CombatPhase;
        vec!["⚔️ Iniciando Fase de Combate".to_string()]
    }

    /// Execute combat for a creature
    pub fn attack_with_creature(&mut self, attacker_index: usize, target_index: Option<usize>) -> Result<Vec<String>, String> {
        if self.phase != GamePhase::CombatPhase {
            return Err("Solo puedes atacar en la Fase de Combate".to_string());
        }

        let attacker = self.current().field.get(attacker_index)
            .ok_or("Criatura atacante no encontrada")?;

        if !attacker.can_attack {
            return Err("Esta criatura no puede atacar este turno".to_string());
        }

        if !attacker.is_creature() {
            return Err("Solo las criaturas pueden atacar".to_string());
        }

        let has_pierce = attacker.keyword == Some(Keyword::Perforar);
        let damage = attacker.get_strength();
        let attacker_name = attacker.name.clone();

        // Mark as attacked
        self.current_mut().field[attacker_index].can_attack = false;

        let mut messages = Vec::new();

        if let Some(target_idx) = target_index {
            // Attack a creature
            let target = self.opponent().field.get(target_idx)
                .ok_or("Criatura objetivo no encontrada")?;

            if !target.is_creature() {
                return Err("Solo puedes atacar criaturas".to_string());
            }

            let target_name = target.name.clone();

            // Create pending attack for reaction window
            self.pending_attacks.push(PendingAttack {
                attacker_player: self.current_player,
                attacker_index,
                target_player: self.opponent_index(),
                target_index: Some(target_idx),
                damage,
                has_pierce,
            });

            messages.push(format!("⚔️ {} ataca a {} ({} daño{})",
                attacker_name, target_name, damage,
                if has_pierce { ", Perforar" } else { "" }));

            self.reaction_window_open = true;

        } else {
            // Direct attack to player
            self.pending_attacks.push(PendingAttack {
                attacker_player: self.current_player,
                attacker_index,
                target_player: self.opponent_index(),
                target_index: None,
                damage,
                has_pierce,
            });

            messages.push(format!("⚔️ {} ataca directamente ({} daño)", attacker_name, damage));
            self.reaction_window_open = true;
        }

        Ok(messages)
    }

    /// Resolve pending attack (after reaction window)
    pub fn resolve_pending_attack(&mut self, attack_cancelled: bool) -> Vec<String> {
        let mut messages = Vec::new();

        if let Some(attack) = self.pending_attacks.pop() {
            if attack_cancelled {
                messages.push("🌫️ ¡Ataque cancelado!".to_string());
            } else if let Some(target_idx) = attack.target_index {
                // Damage creature
                let target = &mut self.players[attack.target_player].field[target_idx];
                let target_name = target.name.clone();
                let died = target.take_damage(attack.damage, attack.has_pierce);

                messages.push(format!("💥 {} recibe {} daño", target_name, attack.damage));

                if died {
                    self.players[attack.target_player].remove_creature(target_idx);
                    messages.push(format!("☠️ {} destruido", target_name));

                    // Check for Cosecha keyword
                    let attacker = &self.players[attack.attacker_player].field.get(attack.attacker_index);
                    if let Some(a) = attacker {
                        if a.keyword == Some(Keyword::Cosecha) {
                            self.players[attack.attacker_player].cacao += 2;
                            messages.push("🌾 Cosecha: +2 cacao".to_string());
                        }
                    }
                }
            } else {
                // Direct damage to player
                self.players[attack.target_player].take_damage(attack.damage);
                messages.push(format!("💔 {} pierde {} HP (Total: {})",
                    self.players[attack.target_player].name,
                    attack.damage,
                    self.players[attack.target_player].hp));
            }
        }

        self.reaction_window_open = false;
        messages
    }

    /// End the turn
    pub fn end_turn(&mut self) -> Vec<String> {
        let mut messages = Vec::new();

        // Track harvested cacao
        let cacao = self.current().cacao;
        self.current_mut().harvest_cacao(cacao);

        // Check victory conditions
        self.check_victory_conditions();

        match &self.result {
            GameResult::Victory { winner, condition } => {
                messages.push(format!("🏆 ¡{} gana por {}!", self.players[*winner].name, condition));
            }
            _ => {
                // Switch players
                self.current_player = 1 - self.current_player;
                if self.current_player == 0 {
                    self.turn_number += 1;
                }
                self.phase = GamePhase::StartPhase;
                messages.push(format!("🔄 Turno de {}", self.current().name));
            }
        }

        messages
    }

    /// Check for victory conditions
    fn check_victory_conditions(&mut self) {
        // Check elimination (opponent HP <= 0)
        if self.opponent().is_eliminated() {
            self.result = GameResult::Victory {
                winner: self.current_player,
                condition: VictoryCondition::Elimination,
            };
            return;
        }

        // Check domination (3+ Guardians at end of turn)
        if self.current().has_domination() {
            self.result = GameResult::Victory {
                winner: self.current_player,
                condition: VictoryCondition::Domination,
            };
            return;
        }

        // Check total harvest (20+ cacao harvested)
        if self.current().has_total_harvest() {
            self.result = GameResult::Victory {
                winner: self.current_player,
                condition: VictoryCondition::TotalHarvest,
            };
        }
    }

    /// Check if game is over
    pub fn is_game_over(&self) -> bool {
        !matches!(self.result, GameResult::InProgress)
    }
}
