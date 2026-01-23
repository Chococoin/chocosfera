//! Base card definitions for Chocósfera TCG
//! Contains the 24 cards of the "Los Primeros" base set

use crate::card::{Card, Keyword, Ability, ReactionTrigger};

/// Create all 24 base cards
pub fn create_base_set() -> Vec<Card> {
    let mut cards = Vec::new();
    cards.extend(create_guardians());
    cards.extend(create_spirits());
    cards.extend(create_resources());
    cards.extend(create_actions());
    cards.extend(create_reactions());
    cards.extend(create_places());
    cards
}

/// Create the 6 base Guardians
pub fn create_guardians() -> Vec<Card> {
    vec![
        // 1. Brote - Floración, producer
        Card::guardian(
            1,
            "Brote",
            2,  // cost
            1,  // strength
            2,  // resistance
            2,  // production
            3,  // speed
            2,  // spirit
            Some(Keyword::Floracion),
            Some(Ability {
                name: "Germinar".to_string(),
                spirit_cost: 1,
                description: "+1🫘".to_string(),
            }),
            Some("+1🫘 al entrar"),
        ),

        // 2. Corteza - Raíces, tank
        Card::guardian(
            2,
            "Corteza",
            3,
            2,  // strength
            4,  // resistance
            1,  // production
            1,  // speed (slow)
            2,
            Some(Keyword::Raices),
            Some(Ability {
                name: "Endurecer".to_string(),
                spirit_cost: 2,
                description: "+2🛡️ este turno".to_string(),
            }),
            Some("+1💪 por cada aliado en campo"),
        ),

        // 3. Savia - Polinización, support
        Card::guardian(
            3,
            "Savia",
            3,
            2,
            2,
            3,  // high production
            2,
            3,
            Some(Keyword::Polinizacion),
            Some(Ability {
                name: "Nutrir".to_string(),
                spirit_cost: 1,
                description: "Un aliado +1💪 +1🛡️".to_string(),
            }),
            Some("Al usar habilidad, todos los aliados +1🛡️"),
        ),

        // 4. Espina - Perforar, aggro
        Card::guardian(
            4,
            "Espina",
            2,
            3,  // high strength
            1,  // glass cannon
            1,
            4,  // fast
            2,
            Some(Keyword::Perforar),
            Some(Ability {
                name: "Punzar".to_string(),
                spirit_cost: 1,
                description: "1 daño directo a cualquier objetivo".to_string(),
            }),
            None,
        ),

        // 5. Sombra - Nocturno, comeback mechanic
        Card::guardian(
            5,
            "Sombra",
            3,
            2,
            2,
            2,
            5,  // fast
            3,
            Some(Keyword::Nocturno),
            Some(Ability {
                name: "Eclipse".to_string(),
                spirit_cost: 2,
                description: "Todos los enemigos -1💪 este turno".to_string(),
            }),
            Some("+2💪 si tienes menos criaturas que el oponente"),
        ),

        // 6. Fruto - Cosecha, snowball
        Card::guardian(
            6,
            "Fruto",
            3,
            1,
            3,
            3,  // high production
            2,
            4,  // high spirit
            Some(Keyword::Cosecha),
            Some(Ability {
                name: "Madurar".to_string(),
                spirit_cost: 2,
                description: "+2🫘 y roba 1 carta".to_string(),
            }),
            Some("Al eliminar un enemigo, +2🫘"),
        ),
    ]
}

/// Create the 4 base Spirits
pub fn create_spirits() -> Vec<Card> {
    vec![
        // 7. Brisa - Speed buff
        Card::spirit(
            7,
            "Brisa",
            1,
            1,  // strength
            1,  // resistance
            6,  // very fast
            2,
            None,
            Some(Ability {
                name: "Impulso".to_string(),
                spirit_cost: 1,
                description: "Un aliado +2💪 este turno".to_string(),
            }),
        ),

        // 8. Gota - Healer
        Card::spirit(
            8,
            "Gota",
            2,
            0,
            2,
            3,
            3,
            None,
            Some(Ability {
                name: "Sanar".to_string(),
                spirit_cost: 1,
                description: "Un aliado +2🛡️".to_string(),
            }),
        ),

        // 9. Chispa - Poison
        Card::spirit(
            9,
            "Chispa",
            2,
            2,
            1,
            5,
            2,
            Some(Keyword::Veneno),
            Some(Ability {
                name: "Quemar".to_string(),
                spirit_cost: 1,
                description: "1 daño a un enemigo, aplica Veneno".to_string(),
            }),
        ),

        // 10. Eco - Copy ability
        Card::spirit(
            10,
            "Eco",
            2,
            1,
            1,
            4,
            4,  // high spirit
            None,
            Some(Ability {
                name: "Copiar".to_string(),
                spirit_cost: 2,
                description: "Usa la habilidad de un aliado sin pagar su costo".to_string(),
            }),
        ),
    ]
}

/// Create the 4 base Resources
pub fn create_resources() -> Vec<Card> {
    vec![
        // 11. Grano de Cacao
        Card::resource(11, "Grano de Cacao", 0, "+2🫘"),

        // 12. Lluvia
        Card::resource(12, "Lluvia", 0, "+1🫘, roba 1 carta"),

        // 13. Sol
        Card::resource(13, "Sol", 0, "Cada Guardián produce +1🫘 este turno"),

        // 14. Abono
        Card::resource(14, "Abono", 1, "+4🫘"),
    ]
}

/// Create the 4 base Actions
pub fn create_actions() -> Vec<Card> {
    vec![
        // 15. Cosecha Dorada
        Card::action(15, "Cosecha Dorada", 1, "+3🫘"),

        // 16. Tormenta
        Card::action(16, "Tormenta", 2, "2 daño a TODAS las criaturas enemigas"),

        // 17. Poda
        Card::action(17, "Poda", 1, "Destruye un Espíritu enemigo"),

        // 18. Injerto
        Card::action(
            18,
            "Injerto",
            2,
            "Tu Guardián copia 💪 y 🛡️ de un Guardián enemigo este turno",
        ),
    ]
}

/// Create the 4 base Reactions
pub fn create_reactions() -> Vec<Card> {
    vec![
        // 19. Niebla - Cancel attack
        Card::reaction(
            19,
            "Niebla",
            1,
            ReactionTrigger::OnAttacked,
            "Cancela el ataque",
        ),

        // 20. Espinas - Reflect damage
        Card::reaction(
            20,
            "Espinas",
            1,
            ReactionTrigger::OnDamageReceived,
            "El atacante recibe 2 daño",
        ),

        // 21. Raíz Oculta - Token on death
        Card::reaction(
            21,
            "Raíz Oculta",
            0,
            ReactionTrigger::OnCreatureDeath,
            "Invoca un token Brote (1💪/1🛡️/1🫘)",
        ),

        // 22. Contraflor - Counter ability
        Card::reaction(
            22,
            "Contraflor",
            2,
            ReactionTrigger::OnEnemyAbility,
            "Cancela la habilidad",
        ),
    ]
}

/// Create the 2 base Places
pub fn create_places() -> Vec<Card> {
    vec![
        // 23. Claro del Bosque - Production boost
        Card::place(23, "Claro del Bosque", 1, "Tus Guardianes producen +1🫘 cada uno"),

        // 24. Río Antiguo - Card draw
        Card::place(24, "Río Antiguo", 2, "Al inicio de tu turno, roba 1 carta adicional"),
    ]
}

/// Create a token creature (for Raíz Oculta)
pub fn create_brote_token() -> Card {
    let mut card = Card::guardian(
        100,  // Special ID for tokens
        "Brote Token",
        0,
        1,
        1,
        1,
        3,
        0,
        None,
        None,
        None,
    );
    card.is_base = false;
    card.can_attack = false;  // Can't attack the turn it enters
    card
}
