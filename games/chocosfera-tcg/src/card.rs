//! Card types and structures for Chocósfera TCG

use std::fmt;

/// Types of cards in the game
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CardType {
    Guardian,
    Spirit,
    Resource,
    Action,
    Reaction,
    Place,
}

impl fmt::Display for CardType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CardType::Guardian => write!(f, "Guardián"),
            CardType::Spirit => write!(f, "Espíritu"),
            CardType::Resource => write!(f, "Recurso"),
            CardType::Action => write!(f, "Acción"),
            CardType::Reaction => write!(f, "Reacción"),
            CardType::Place => write!(f, "Lugar"),
        }
    }
}

/// Keywords that provide synergies and special effects
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Keyword {
    /// Effect triggers when entering the field
    Floracion,
    /// Effect triggers when eliminating an enemy
    Cosecha,
    /// Bonus while having other allies
    Raices,
    /// Bonus when having fewer creatures than opponent
    Nocturno,
    /// When using ability, allies gain buff
    Polinizacion,
    /// Ignores 2 points of defense when attacking
    Perforar,
    /// Target takes 1 damage at start of their turn
    Veneno,
}

impl fmt::Display for Keyword {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Keyword::Floracion => write!(f, "Floración"),
            Keyword::Cosecha => write!(f, "Cosecha"),
            Keyword::Raices => write!(f, "Raíces"),
            Keyword::Nocturno => write!(f, "Nocturno"),
            Keyword::Polinizacion => write!(f, "Polinización"),
            Keyword::Perforar => write!(f, "Perforar"),
            Keyword::Veneno => write!(f, "Veneno"),
        }
    }
}

impl Keyword {
    pub fn description(&self) -> &'static str {
        match self {
            Keyword::Floracion => "Efecto al entrar al campo",
            Keyword::Cosecha => "Efecto al eliminar enemigo",
            Keyword::Raices => "Bonus por tener aliados",
            Keyword::Nocturno => "Bonus si tienes menos criaturas",
            Keyword::Polinizacion => "Al usar habilidad, aliados ganan buff",
            Keyword::Perforar => "Ignora 2 puntos de defensa",
            Keyword::Veneno => "Enemigo pierde 1🛡️ al inicio de su turno",
        }
    }
}

/// Triggers for reaction cards
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ReactionTrigger {
    /// When one of your creatures is attacked
    OnAttacked,
    /// When one of your creatures receives damage
    OnDamageReceived,
    /// When one of your creatures dies
    OnCreatureDeath,
    /// When enemy uses an ability
    OnEnemyAbility,
}

impl fmt::Display for ReactionTrigger {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ReactionTrigger::OnAttacked => write!(f, "Al ser atacado"),
            ReactionTrigger::OnDamageReceived => write!(f, "Al recibir daño"),
            ReactionTrigger::OnCreatureDeath => write!(f, "Al morir criatura"),
            ReactionTrigger::OnEnemyAbility => write!(f, "Al usar habilidad enemiga"),
        }
    }
}

/// Combat stats for creatures
#[derive(Clone, Debug)]
pub struct Stats {
    /// 💪 Damage in combat
    pub strength: i32,
    /// 🛡️ Maximum HP
    pub resistance: i32,
    /// 🛡️ Current HP (can be lower)
    pub current_hp: i32,
    /// 🫘 Cacao produced per turn
    pub production: i32,
    /// ⚡ Speed phase (1-6)
    pub speed: i32,
    /// ✨ Spirit points for abilities
    pub spirit: i32,
}

impl Stats {
    pub fn new(strength: i32, resistance: i32, production: i32, speed: i32, spirit: i32) -> Self {
        Stats {
            strength,
            resistance,
            current_hp: resistance,
            production,
            speed,
            spirit,
        }
    }
}

/// Special ability of a card
#[derive(Clone, Debug)]
pub struct Ability {
    pub name: String,
    pub spirit_cost: i32,
    pub description: String,
}

/// A card in the game
#[derive(Clone, Debug)]
pub struct Card {
    pub id: u32,
    pub name: String,
    pub card_type: CardType,
    pub cacao_cost: i32,
    pub stats: Option<Stats>,
    pub keyword: Option<Keyword>,
    pub ability: Option<Ability>,
    pub effect: Option<String>,
    pub reaction_trigger: Option<ReactionTrigger>,
    pub spirit_cost: Option<i32>,
    pub is_base: bool,
    pub creator: Option<String>,

    // Runtime state
    pub can_attack: bool,
    pub ability_used: bool,
    pub has_poison: bool,
    pub temp_strength_buff: i32,
    pub temp_resistance_buff: i32,
}

impl Card {
    /// Create a new Guardian card
    pub fn guardian(
        id: u32,
        name: &str,
        cost: i32,
        strength: i32,
        resistance: i32,
        production: i32,
        speed: i32,
        spirit: i32,
        keyword: Option<Keyword>,
        ability: Option<Ability>,
        effect: Option<&str>,
    ) -> Self {
        Card {
            id,
            name: name.to_string(),
            card_type: CardType::Guardian,
            cacao_cost: cost,
            stats: Some(Stats::new(strength, resistance, production, speed, spirit)),
            keyword,
            ability,
            effect: effect.map(|s| s.to_string()),
            reaction_trigger: None,
            spirit_cost: None,
            is_base: true,
            creator: None,
            can_attack: false,
            ability_used: false,
            has_poison: false,
            temp_strength_buff: 0,
            temp_resistance_buff: 0,
        }
    }

    /// Create a new Spirit card
    pub fn spirit(
        id: u32,
        name: &str,
        cost: i32,
        strength: i32,
        resistance: i32,
        speed: i32,
        spirit: i32,
        keyword: Option<Keyword>,
        ability: Option<Ability>,
    ) -> Self {
        Card {
            id,
            name: name.to_string(),
            card_type: CardType::Spirit,
            cacao_cost: cost,
            stats: Some(Stats::new(strength, resistance, 0, speed, spirit)),
            keyword,
            ability,
            effect: None,
            reaction_trigger: None,
            spirit_cost: None,
            is_base: true,
            creator: None,
            can_attack: false,
            ability_used: false,
            has_poison: false,
            temp_strength_buff: 0,
            temp_resistance_buff: 0,
        }
    }

    /// Create a new Resource card
    pub fn resource(id: u32, name: &str, cost: i32, effect: &str) -> Self {
        Card {
            id,
            name: name.to_string(),
            card_type: CardType::Resource,
            cacao_cost: cost,
            stats: None,
            keyword: None,
            ability: None,
            effect: Some(effect.to_string()),
            reaction_trigger: None,
            spirit_cost: None,
            is_base: true,
            creator: None,
            can_attack: false,
            ability_used: false,
            has_poison: false,
            temp_strength_buff: 0,
            temp_resistance_buff: 0,
        }
    }

    /// Create a new Action card
    pub fn action(id: u32, name: &str, cost: i32, effect: &str) -> Self {
        Card {
            id,
            name: name.to_string(),
            card_type: CardType::Action,
            cacao_cost: cost,
            stats: None,
            keyword: None,
            ability: None,
            effect: Some(effect.to_string()),
            reaction_trigger: None,
            spirit_cost: None,
            is_base: true,
            creator: None,
            can_attack: false,
            ability_used: false,
            has_poison: false,
            temp_strength_buff: 0,
            temp_resistance_buff: 0,
        }
    }

    /// Create a new Reaction card
    pub fn reaction(id: u32, name: &str, spirit_cost: i32, trigger: ReactionTrigger, effect: &str) -> Self {
        Card {
            id,
            name: name.to_string(),
            card_type: CardType::Reaction,
            cacao_cost: 0,
            stats: None,
            keyword: None,
            ability: None,
            effect: Some(effect.to_string()),
            reaction_trigger: Some(trigger),
            spirit_cost: Some(spirit_cost),
            is_base: true,
            creator: None,
            can_attack: false,
            ability_used: false,
            has_poison: false,
            temp_strength_buff: 0,
            temp_resistance_buff: 0,
        }
    }

    /// Create a new Place card
    pub fn place(id: u32, name: &str, cost: i32, effect: &str) -> Self {
        Card {
            id,
            name: name.to_string(),
            card_type: CardType::Place,
            cacao_cost: cost,
            stats: None,
            keyword: None,
            ability: None,
            effect: Some(effect.to_string()),
            reaction_trigger: None,
            spirit_cost: None,
            is_base: true,
            creator: None,
            can_attack: false,
            ability_used: false,
            has_poison: false,
            temp_strength_buff: 0,
            temp_resistance_buff: 0,
        }
    }

    /// Check if card is a creature (Guardian or Spirit)
    pub fn is_creature(&self) -> bool {
        matches!(self.card_type, CardType::Guardian | CardType::Spirit)
    }

    /// Get effective strength including buffs
    pub fn get_strength(&self) -> i32 {
        if let Some(ref stats) = self.stats {
            stats.strength + self.temp_strength_buff
        } else {
            0
        }
    }

    /// Get current HP
    pub fn get_current_hp(&self) -> i32 {
        if let Some(ref stats) = self.stats {
            stats.current_hp + self.temp_resistance_buff
        } else {
            0
        }
    }

    /// Get speed phase
    pub fn get_speed(&self) -> i32 {
        self.stats.as_ref().map(|s| s.speed).unwrap_or(0)
    }

    /// Get production
    pub fn get_production(&self) -> i32 {
        if self.card_type == CardType::Guardian {
            self.stats.as_ref().map(|s| s.production).unwrap_or(0)
        } else {
            0
        }
    }

    /// Take damage, returns true if creature dies
    pub fn take_damage(&mut self, damage: i32, has_pierce: bool) -> bool {
        if let Some(ref mut stats) = self.stats {
            // Pierce ignores 2 defense
            if !has_pierce {
                // Normal damage reduction doesn't apply in this game
            }
            stats.current_hp -= damage;
            stats.current_hp <= 0
        } else {
            false
        }
    }

    /// Heal the creature
    pub fn heal(&mut self, amount: i32) {
        if let Some(ref mut stats) = self.stats {
            stats.current_hp = std::cmp::min(stats.current_hp + amount, stats.resistance);
        }
    }

    /// Reset turn-based buffs
    pub fn reset_turn_buffs(&mut self) {
        self.temp_strength_buff = 0;
        self.temp_resistance_buff = 0;
        self.ability_used = false;
    }

    /// Apply poison damage
    pub fn apply_poison(&mut self) -> bool {
        if self.has_poison {
            if let Some(ref mut stats) = self.stats {
                stats.current_hp -= 1;
                return stats.current_hp <= 0;
            }
        }
        false
    }
}
