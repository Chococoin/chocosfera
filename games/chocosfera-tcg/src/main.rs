//! Chocosfera TCG - Simulador de Juego de Cartas
//! Un juego donde cada Guardian representa un arbol de cacao real.

use colored::Colorize;
use crossterm::{
    cursor,
    execute,
    terminal::{self, ClearType},
};
use rand::seq::SliceRandom;
use std::collections::HashMap;
use std::io::{self, Write};

// ============================================
// TIPOS Y ESTRUCTURAS
// ============================================

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TipoCarta {
    Guardian,
    Espiritu,
    Recurso,
    Accion,
    Lugar,
}

impl TipoCarta {
    fn emoji(&self) -> &'static str {
        match self {
            TipoCarta::Guardian => "🌳",
            TipoCarta::Espiritu => "👻",
            TipoCarta::Recurso => "🫘",
            TipoCarta::Accion => "⚡",
            TipoCarta::Lugar => "🏠",
        }
    }

    fn abreviatura(&self) -> &'static str {
        match self {
            TipoCarta::Guardian => "GUA",
            TipoCarta::Espiritu => "ESP",
            TipoCarta::Recurso => "REC",
            TipoCarta::Accion => "ACC",
            TipoCarta::Lugar => "LUG",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Fase {
    Produccion,
    Robar,
    Jugar,
    Combate,
    FinTurno,
}

impl Fase {
    fn nombre(&self) -> &'static str {
        match self {
            Fase::Produccion => "Producción",
            Fase::Robar => "Robar",
            Fase::Jugar => "Jugar Cartas",
            Fase::Combate => "Combate",
            Fase::FinTurno => "Fin de Turno",
        }
    }
}

#[derive(Debug, Clone)]
pub struct Stats {
    pub fuerza: i32,
    pub resistencia: i32,
    pub resistencia_max: i32,
    pub produccion: i32,
    pub velocidad: i32,
    pub espiritu: i32,
    pub espiritu_max: i32,
}

impl Stats {
    fn new(fuerza: i32, resistencia: i32, produccion: i32, velocidad: i32, espiritu: i32) -> Self {
        Stats {
            fuerza,
            resistencia,
            resistencia_max: resistencia,
            produccion,
            velocidad,
            espiritu,
            espiritu_max: espiritu,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Habilidad {
    pub nombre: String,
    pub costo_espiritu: i32,
    pub descripcion: String,
    pub efecto: EfectoHabilidad,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EfectoHabilidad {
    BuffFuerza(i32),
    Inmunidad,
    DanoDirecto(i32),
    BuffAliadoFuerza(i32),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EfectoCarta {
    GanarCacao(i32),
    GanarCacaoYRobar(i32, i32),
    DanoATodos(i32),
    ProduccionExtra(i32),
}

#[derive(Debug, Clone)]
pub struct Carta {
    pub id: String,
    pub nombre: String,
    pub tipo: TipoCarta,
    pub costo: i32,
    pub stats: Option<Stats>,
    pub habilidad: Option<Habilidad>,
    pub efecto: Option<EfectoCarta>,
    pub descripcion: String,

    // Estado en juego
    pub puede_atacar: bool,
    pub habilidad_usada: bool,
    pub buffs_turno: HashMap<String, i32>,
    pub inmune_dano: bool,
}

impl Carta {
    fn new_guardian(
        id: &str,
        nombre: &str,
        costo: i32,
        stats: Stats,
        habilidad: Habilidad,
        descripcion: &str,
    ) -> Self {
        Carta {
            id: id.to_string(),
            nombre: nombre.to_string(),
            tipo: TipoCarta::Guardian,
            costo,
            stats: Some(stats),
            habilidad: Some(habilidad),
            efecto: None,
            descripcion: descripcion.to_string(),
            puede_atacar: false,
            habilidad_usada: false,
            buffs_turno: HashMap::new(),
            inmune_dano: false,
        }
    }

    fn new_espiritu(
        id: &str,
        nombre: &str,
        costo: i32,
        stats: Stats,
        habilidad: Habilidad,
        descripcion: &str,
    ) -> Self {
        Carta {
            id: id.to_string(),
            nombre: nombre.to_string(),
            tipo: TipoCarta::Espiritu,
            costo,
            stats: Some(stats),
            habilidad: Some(habilidad),
            efecto: None,
            descripcion: descripcion.to_string(),
            puede_atacar: false,
            habilidad_usada: false,
            buffs_turno: HashMap::new(),
            inmune_dano: false,
        }
    }

    fn new_recurso(id: &str, nombre: &str, efecto: EfectoCarta, descripcion: &str) -> Self {
        Carta {
            id: id.to_string(),
            nombre: nombre.to_string(),
            tipo: TipoCarta::Recurso,
            costo: 0,
            stats: None,
            habilidad: None,
            efecto: Some(efecto),
            descripcion: descripcion.to_string(),
            puede_atacar: false,
            habilidad_usada: false,
            buffs_turno: HashMap::new(),
            inmune_dano: false,
        }
    }

    fn new_accion(id: &str, nombre: &str, costo: i32, efecto: EfectoCarta, descripcion: &str) -> Self {
        Carta {
            id: id.to_string(),
            nombre: nombre.to_string(),
            tipo: TipoCarta::Accion,
            costo,
            stats: None,
            habilidad: None,
            efecto: Some(efecto),
            descripcion: descripcion.to_string(),
            puede_atacar: false,
            habilidad_usada: false,
            buffs_turno: HashMap::new(),
            inmune_dano: false,
        }
    }

    fn new_lugar(id: &str, nombre: &str, costo: i32, efecto: EfectoCarta, descripcion: &str) -> Self {
        Carta {
            id: id.to_string(),
            nombre: nombre.to_string(),
            tipo: TipoCarta::Lugar,
            costo,
            stats: None,
            habilidad: None,
            efecto: Some(efecto),
            descripcion: descripcion.to_string(),
            puede_atacar: false,
            habilidad_usada: false,
            buffs_turno: HashMap::new(),
            inmune_dano: false,
        }
    }

    fn reset_turno(&mut self) {
        self.puede_atacar = true;
        self.habilidad_usada = false;
        self.buffs_turno.clear();
        self.inmune_dano = false;
        if let Some(ref mut stats) = self.stats {
            stats.espiritu = stats.espiritu_max;
        }
    }

    fn get_fuerza(&self) -> i32 {
        match &self.stats {
            Some(s) => s.fuerza + self.buffs_turno.get("fuerza").unwrap_or(&0),
            None => 0,
        }
    }

    fn recibir_dano(&mut self, cantidad: i32) -> bool {
        if self.inmune_dano {
            return false;
        }
        if let Some(ref mut stats) = self.stats {
            stats.resistencia -= cantidad;
            return stats.resistencia <= 0;
        }
        false
    }

    fn es_criatura(&self) -> bool {
        matches!(self.tipo, TipoCarta::Guardian | TipoCarta::Espiritu)
    }
}

#[derive(Debug, Clone)]
pub struct Jugador {
    pub nombre: String,
    pub hp: i32,
    pub hp_max: i32,
    pub cacao: i32,
    pub mazo: Vec<Carta>,
    pub mano: Vec<Carta>,
    pub campo: Vec<Carta>,
    pub lugares: Vec<Carta>,
    pub descarte: Vec<Carta>,
}

impl Jugador {
    fn new(nombre: &str, mazo: Vec<Carta>) -> Self {
        Jugador {
            nombre: nombre.to_string(),
            hp: 10,
            hp_max: 10,
            cacao: 3,
            mazo,
            mano: Vec::new(),
            campo: Vec::new(),
            lugares: Vec::new(),
            descarte: Vec::new(),
        }
    }

    fn robar_carta(&mut self) -> Option<Carta> {
        if !self.mazo.is_empty() {
            let carta = self.mazo.remove(0);
            self.mano.push(carta.clone());
            Some(carta)
        } else {
            None
        }
    }

    fn producir_cacao(&self, bonus_lugar: i32) -> i32 {
        self.campo
            .iter()
            .filter(|c| c.tipo == TipoCarta::Guardian)
            .filter_map(|c| c.stats.as_ref())
            .map(|s| s.produccion + bonus_lugar)
            .sum()
    }

    fn contar_guardianes(&self) -> usize {
        self.campo
            .iter()
            .filter(|c| c.tipo == TipoCarta::Guardian)
            .count()
    }

    fn reset_criaturas_turno(&mut self) {
        for carta in &mut self.campo {
            carta.reset_turno();
        }
    }

    fn tiene_plantacion(&self) -> bool {
        self.lugares.iter().any(|c| c.id == "plantacion")
    }
}

// ============================================
// BASE DE DATOS DE CARTAS
// ============================================

fn crear_cartas_base() -> Vec<Carta> {
    vec![
        // GUARDIANES
        Carta::new_guardian(
            "luna",
            "Luna",
            3,
            Stats::new(2, 3, 2, 3, 4),
            Habilidad {
                nombre: "Luz Nocturna".to_string(),
                costo_espiritu: 2,
                descripcion: "Gana +2 fuerza este turno".to_string(),
                efecto: EfectoHabilidad::BuffFuerza(2),
            },
            "Guardiana nocturna del cacao",
        ),
        Carta::new_guardian(
            "raiz",
            "Raíz",
            3,
            Stats::new(4, 4, 1, 1, 2),
            Habilidad {
                nombre: "Anclaje".to_string(),
                costo_espiritu: 2,
                descripcion: "No recibe daño este turno".to_string(),
                efecto: EfectoHabilidad::Inmunidad,
            },
            "Guardián ancestral de raíces profundas",
        ),
        Carta::new_guardian(
            "aurora",
            "Aurora",
            3,
            Stats::new(3, 2, 3, 4, 3),
            Habilidad {
                nombre: "Destello".to_string(),
                costo_espiritu: 1,
                descripcion: "Hace 1 daño directo al oponente".to_string(),
                efecto: EfectoHabilidad::DanoDirecto(1),
            },
            "Guardiana del amanecer",
        ),
        // ESPIRITUS
        Carta::new_espiritu(
            "viento",
            "Viento del Sur",
            2,
            Stats::new(1, 1, 0, 5, 2),
            Habilidad {
                nombre: "Impulso".to_string(),
                costo_espiritu: 1,
                descripcion: "Da +2 fuerza a otro aliado este turno".to_string(),
                efecto: EfectoHabilidad::BuffAliadoFuerza(2),
            },
            "Espíritu veloz del viento",
        ),
        Carta::new_espiritu(
            "colibri",
            "Colibrí",
            2,
            Stats::new(1, 1, 0, 6, 3),
            Habilidad {
                nombre: "Picotazo".to_string(),
                costo_espiritu: 1,
                descripcion: "Hace 2 daño directo al oponente".to_string(),
                efecto: EfectoHabilidad::DanoDirecto(2),
            },
            "Pequeño pero letal",
        ),
        // RECURSOS
        Carta::new_recurso(
            "grano",
            "Grano de Cacao",
            EfectoCarta::GanarCacao(2),
            "Un grano maduro listo para usar",
        ),
        Carta::new_recurso(
            "lluvia",
            "Lluvia",
            EfectoCarta::GanarCacaoYRobar(1, 1),
            "Bendición de las nubes",
        ),
        // ACCIONES
        Carta::new_accion(
            "cosecha",
            "Cosecha",
            1,
            EfectoCarta::GanarCacao(3),
            "Tiempo de recoger los frutos",
        ),
        Carta::new_accion(
            "tormenta",
            "Tormenta",
            2,
            EfectoCarta::DanoATodos(2),
            "La furia de la naturaleza",
        ),
        // LUGARES
        Carta::new_lugar(
            "plantacion",
            "Plantación Pincay",
            1,
            EfectoCarta::ProduccionExtra(1),
            "Tierras fértiles del Ecuador",
        ),
    ]
}

fn crear_mazo_inicial() -> Vec<Carta> {
    let mut mazo = crear_cartas_base();
    let mut rng = rand::thread_rng();
    mazo.shuffle(&mut rng);
    mazo
}

// ============================================
// MOTOR DEL JUEGO
// ============================================

pub struct Juego {
    pub jugador1: Jugador,
    pub jugador2: Jugador,
    pub turno_jugador1: bool,
    pub turno: u32,
    pub fase: Fase,
    pub juego_terminado: bool,
    pub ganador: Option<usize>, // 1 o 2
    pub log: Vec<String>,
}

impl Juego {
    fn new(nombre_j1: &str, nombre_j2: &str) -> Self {
        let mut jugador1 = Jugador::new(nombre_j1, crear_mazo_inicial());
        let mut jugador2 = Jugador::new(nombre_j2, crear_mazo_inicial());

        // Robar mano inicial
        for _ in 0..5 {
            jugador1.robar_carta();
            jugador2.robar_carta();
        }

        let mut juego = Juego {
            jugador1,
            jugador2,
            turno_jugador1: true,
            turno: 1,
            fase: Fase::Produccion,
            juego_terminado: false,
            ganador: None,
            log: Vec::new(),
        };

        juego.agregar_log("¡Comienza la partida!");
        juego
    }

    fn jugador_actual(&self) -> &Jugador {
        if self.turno_jugador1 {
            &self.jugador1
        } else {
            &self.jugador2
        }
    }

    fn jugador_actual_mut(&mut self) -> &mut Jugador {
        if self.turno_jugador1 {
            &mut self.jugador1
        } else {
            &mut self.jugador2
        }
    }

    fn oponente(&self) -> &Jugador {
        if self.turno_jugador1 {
            &self.jugador2
        } else {
            &self.jugador1
        }
    }

    fn oponente_mut(&mut self) -> &mut Jugador {
        if self.turno_jugador1 {
            &mut self.jugador2
        } else {
            &mut self.jugador1
        }
    }

    fn agregar_log(&mut self, mensaje: &str) {
        self.log.push(mensaje.to_string());
        if self.log.len() > 8 {
            self.log.remove(0);
        }
    }

    fn cambiar_turno(&mut self) {
        self.turno_jugador1 = !self.turno_jugador1;
        self.turno += 1;
        self.fase = Fase::Produccion;
        self.jugador_actual_mut().reset_criaturas_turno();
        let nombre = self.jugador_actual().nombre.clone();
        self.agregar_log(&format!("--- Turno {}: {} ---", self.turno, nombre));
    }

    fn verificar_victoria(&mut self) -> bool {
        // Victoria por HP
        if self.jugador1.hp <= 0 {
            self.juego_terminado = true;
            self.ganador = Some(2);
            return true;
        }
        if self.jugador2.hp <= 0 {
            self.juego_terminado = true;
            self.ganador = Some(1);
            return true;
        }

        // Victoria por 3 guardianes
        if self.jugador1.contar_guardianes() >= 3 {
            self.juego_terminado = true;
            self.ganador = Some(1);
            return true;
        }
        if self.jugador2.contar_guardianes() >= 3 {
            self.juego_terminado = true;
            self.ganador = Some(2);
            return true;
        }

        false
    }

    fn fase_produccion(&mut self) {
        let bonus = if self.jugador_actual().tiene_plantacion() { 1 } else { 0 };
        let producido = self.jugador_actual().producir_cacao(bonus);
        self.jugador_actual_mut().cacao += producido;
        if producido > 0 {
            self.agregar_log(&format!("Producción: +{} cacao", producido));
        }
        self.fase = Fase::Robar;
    }

    fn fase_robar(&mut self) {
        if let Some(carta) = self.jugador_actual_mut().robar_carta() {
            self.agregar_log(&format!("Robaste: {}", carta.nombre));
        } else {
            self.agregar_log("¡Mazo vacío!");
        }
        self.fase = Fase::Jugar;
    }

    fn puede_jugar_carta(&self, indice: usize) -> bool {
        if indice < self.jugador_actual().mano.len() {
            let carta = &self.jugador_actual().mano[indice];
            self.jugador_actual().cacao >= carta.costo
        } else {
            false
        }
    }

    fn jugar_carta(&mut self, indice: usize) -> bool {
        if !self.puede_jugar_carta(indice) {
            return false;
        }

        let carta = self.jugador_actual_mut().mano.remove(indice);
        self.jugador_actual_mut().cacao -= carta.costo;

        match carta.tipo {
            TipoCarta::Guardian | TipoCarta::Espiritu => {
                let nombre = carta.nombre.clone();
                let mut carta = carta;
                carta.puede_atacar = false;
                self.jugador_actual_mut().campo.push(carta);
                self.agregar_log(&format!("¡Invocaste a {}!", nombre));
            }
            TipoCarta::Lugar => {
                let nombre = carta.nombre.clone();
                self.jugador_actual_mut().lugares.push(carta);
                self.agregar_log(&format!("¡Colocaste {}!", nombre));
            }
            TipoCarta::Recurso | TipoCarta::Accion => {
                self.ejecutar_efecto_carta(&carta);
                self.jugador_actual_mut().descarte.push(carta);
            }
        }

        self.verificar_victoria();
        true
    }

    fn ejecutar_efecto_carta(&mut self, carta: &Carta) {
        if let Some(efecto) = &carta.efecto {
            match efecto {
                EfectoCarta::GanarCacao(cantidad) => {
                    self.jugador_actual_mut().cacao += cantidad;
                    self.agregar_log(&format!("{}: +{} cacao", carta.nombre, cantidad));
                }
                EfectoCarta::GanarCacaoYRobar(cacao, cartas) => {
                    self.jugador_actual_mut().cacao += cacao;
                    for _ in 0..*cartas {
                        self.jugador_actual_mut().robar_carta();
                    }
                    self.agregar_log(&format!("{}: +{} cacao, +{} carta", carta.nombre, cacao, cartas));
                }
                EfectoCarta::DanoATodos(dano) => {
                    let mut muertes = Vec::new();
                    let oponente = self.oponente_mut();
                    let mut i = 0;
                    while i < oponente.campo.len() {
                        if oponente.campo[i].recibir_dano(*dano) {
                            let muerta = oponente.campo.remove(i);
                            muertes.push(muerta.nombre.clone());
                            oponente.descarte.push(muerta);
                        } else {
                            i += 1;
                        }
                    }
                    self.agregar_log(&format!("¡{}! {} daño a todos", carta.nombre, dano));
                    if !muertes.is_empty() {
                        self.agregar_log(&format!("Destruidos: {}", muertes.join(", ")));
                    }
                }
                EfectoCarta::ProduccionExtra(_) => {
                    // El efecto se aplica pasivamente
                }
            }
        }
    }

    fn puede_atacar(&self, indice: usize) -> bool {
        if indice < self.jugador_actual().campo.len() {
            let carta = &self.jugador_actual().campo[indice];
            carta.puede_atacar && carta.es_criatura()
        } else {
            false
        }
    }

    fn atacar_jugador(&mut self, indice_atacante: usize) -> bool {
        if !self.puede_atacar(indice_atacante) {
            return false;
        }

        let dano = self.jugador_actual().campo[indice_atacante].get_fuerza();
        let nombre_atacante = self.jugador_actual().campo[indice_atacante].nombre.clone();
        let nombre_oponente = self.oponente().nombre.clone();

        self.oponente_mut().hp -= dano;
        self.jugador_actual_mut().campo[indice_atacante].puede_atacar = false;

        self.agregar_log(&format!(
            "{} ataca a {}! -{} HP",
            nombre_atacante, nombre_oponente, dano
        ));
        self.verificar_victoria();
        true
    }

    fn atacar_criatura(&mut self, indice_atacante: usize, indice_defensor: usize) -> bool {
        if !self.puede_atacar(indice_atacante) {
            return false;
        }
        if indice_defensor >= self.oponente().campo.len() {
            return false;
        }

        let dano = self.jugador_actual().campo[indice_atacante].get_fuerza();
        let nombre_atacante = self.jugador_actual().campo[indice_atacante].nombre.clone();
        let nombre_defensor = self.oponente().campo[indice_defensor].nombre.clone();

        let murio = self.oponente_mut().campo[indice_defensor].recibir_dano(dano);

        if murio {
            let defensor = self.oponente_mut().campo.remove(indice_defensor);
            self.oponente_mut().descarte.push(defensor);
            self.agregar_log(&format!(
                "{} destruye a {}!",
                nombre_atacante, nombre_defensor
            ));
        } else {
            self.agregar_log(&format!(
                "{} ataca a {}! -{} resistencia",
                nombre_atacante, nombre_defensor, dano
            ));
        }

        self.jugador_actual_mut().campo[indice_atacante].puede_atacar = false;
        self.verificar_victoria();
        true
    }

    fn puede_usar_habilidad(&self, indice: usize) -> bool {
        if indice < self.jugador_actual().campo.len() {
            let carta = &self.jugador_actual().campo[indice];
            if let (Some(hab), Some(stats)) = (&carta.habilidad, &carta.stats) {
                return !carta.habilidad_usada && stats.espiritu >= hab.costo_espiritu;
            }
        }
        false
    }

    fn usar_habilidad(&mut self, indice: usize, objetivo: Option<usize>) -> bool {
        if !self.puede_usar_habilidad(indice) {
            return false;
        }

        let carta = &self.jugador_actual().campo[indice];
        let habilidad = carta.habilidad.clone().unwrap();
        let nombre_carta = carta.nombre.clone();

        // Descontar espíritu
        if let Some(ref mut stats) = self.jugador_actual_mut().campo[indice].stats {
            stats.espiritu -= habilidad.costo_espiritu;
        }
        self.jugador_actual_mut().campo[indice].habilidad_usada = true;

        match habilidad.efecto {
            EfectoHabilidad::BuffFuerza(cantidad) => {
                let buff = self.jugador_actual_mut().campo[indice]
                    .buffs_turno
                    .entry("fuerza".to_string())
                    .or_insert(0);
                *buff += cantidad;
                self.agregar_log(&format!(
                    "{} usa {}! +{} fuerza",
                    nombre_carta, habilidad.nombre, cantidad
                ));
            }
            EfectoHabilidad::Inmunidad => {
                self.jugador_actual_mut().campo[indice].inmune_dano = true;
                self.agregar_log(&format!(
                    "{} usa {}! Inmune al daño",
                    nombre_carta, habilidad.nombre
                ));
            }
            EfectoHabilidad::DanoDirecto(cantidad) => {
                self.oponente_mut().hp -= cantidad;
                let nombre_oponente = self.oponente().nombre.clone();
                self.agregar_log(&format!(
                    "{} usa {}! {} -{} HP",
                    nombre_carta, habilidad.nombre, nombre_oponente, cantidad
                ));
            }
            EfectoHabilidad::BuffAliadoFuerza(cantidad) => {
                if let Some(obj_idx) = objetivo {
                    if obj_idx < self.jugador_actual().campo.len() && obj_idx != indice {
                        let nombre_aliado = self.jugador_actual().campo[obj_idx].nombre.clone();
                        let buff = self.jugador_actual_mut().campo[obj_idx]
                            .buffs_turno
                            .entry("fuerza".to_string())
                            .or_insert(0);
                        *buff += cantidad;
                        self.agregar_log(&format!(
                            "{} usa {}! {} +{} fuerza",
                            nombre_carta, habilidad.nombre, nombre_aliado, cantidad
                        ));
                    } else {
                        // Devolver espíritu
                        if let Some(ref mut stats) = self.jugador_actual_mut().campo[indice].stats {
                            stats.espiritu += habilidad.costo_espiritu;
                        }
                        self.jugador_actual_mut().campo[indice].habilidad_usada = false;
                        return false;
                    }
                } else {
                    // Sin objetivo
                    if let Some(ref mut stats) = self.jugador_actual_mut().campo[indice].stats {
                        stats.espiritu += habilidad.costo_espiritu;
                    }
                    self.jugador_actual_mut().campo[indice].habilidad_usada = false;
                    return false;
                }
            }
        }

        self.verificar_victoria();
        true
    }
}

// ============================================
// INTERFAZ DE TERMINAL
// ============================================

struct Interfaz {
    juego: Juego,
}

impl Interfaz {
    fn new(nombre_j1: &str, nombre_j2: &str) -> Self {
        Interfaz {
            juego: Juego::new(nombre_j1, nombre_j2),
        }
    }

    fn limpiar_pantalla(&self) {
        execute!(io::stdout(), terminal::Clear(ClearType::All), cursor::MoveTo(0, 0)).ok();
    }

    fn dibujar_carta_mini(&self, carta: &Carta) -> Vec<String> {
        let ancho = 14;
        let color_fn: fn(&str) -> colored::ColoredString = match carta.tipo {
            TipoCarta::Guardian => |s| s.green(),
            TipoCarta::Espiritu => |s| s.cyan(),
            TipoCarta::Recurso => |s| s.yellow(),
            TipoCarta::Accion => |s| s.red(),
            TipoCarta::Lugar => |s| s.magenta(),
        };

        let nombre: String = carta.nombre.chars().take(ancho - 2).collect();
        let borde = "-".repeat(ancho - 2);

        let mut lineas = vec![
            format!("{}", color_fn(&format!("+{}+", borde))),
            format!("{}", color_fn(&format!("|{:^width$}|", nombre, width = ancho - 2))),
        ];

        if let Some(ref stats) = carta.stats {
            let stats1 = format!("F:{} R:{}", carta.get_fuerza(), stats.resistencia);
            let stats2 = format!("P:{} E:{}", stats.produccion, stats.espiritu);
            lineas.push(format!("{}", color_fn(&format!("|{:^width$}|", stats1, width = ancho - 2))));
            lineas.push(format!("{}", color_fn(&format!("|{:^width$}|", stats2, width = ancho - 2))));
        } else {
            let tipo_str = carta.tipo.abreviatura();
            let costo_str = format!("C:{}", carta.costo);
            lineas.push(format!("{}", color_fn(&format!("|{:^width$}|", tipo_str, width = ancho - 2))));
            lineas.push(format!("{}", color_fn(&format!("|{:^width$}|", costo_str, width = ancho - 2))));
        }

        lineas.push(format!("{}", color_fn(&format!("+{}+", borde))));
        lineas
    }

    fn dibujar_campo(&self) {
        let j = &self.juego;
        let ancho = 80;

        println!();
        println!("{}", "=".repeat(ancho));
        println!(
            "{}",
            format!("              CHOCOSFERA TCG - Turno {}", j.turno).bold()
        );
        println!("{}", "=".repeat(ancho));

        // Oponente
        println!();
        println!(
            "  {} {} {}",
            "===".red(),
            j.oponente().nombre.red().bold(),
            "===".red()
        );
        println!(
            "  ❤️  HP: {}/{}   🫘 Cacao: {}   🃏 Mano: {}   📚 Mazo: {}",
            j.oponente().hp,
            j.oponente().hp_max,
            j.oponente().cacao,
            j.oponente().mano.len(),
            j.oponente().mazo.len()
        );

        // Campo del oponente
        println!();
        println!("  {}", "--- Campo del oponente ---".dimmed());
        if !j.oponente().campo.is_empty() {
            let cartas_lineas: Vec<Vec<String>> = j
                .oponente()
                .campo
                .iter()
                .map(|c| self.dibujar_carta_mini(c))
                .collect();

            for row in 0..5 {
                let mut linea = String::from("  ");
                for carta_lineas in &cartas_lineas {
                    if row < carta_lineas.len() {
                        linea.push_str(&carta_lineas[row]);
                        linea.push(' ');
                    }
                }
                println!("{}", linea);
            }
        } else {
            println!("  {}", "(vacío)".dimmed());
        }

        if !j.oponente().lugares.is_empty() {
            let nombres: Vec<&str> = j.oponente().lugares.iter().map(|c| c.nombre.as_str()).collect();
            println!("  Lugares: {}", nombres.join(", ").magenta());
        }

        println!();
        println!("  {}", "-".repeat(60));

        // Campo del jugador
        println!();
        println!("  {}", "--- Tu campo ---".dimmed());
        if !j.jugador_actual().campo.is_empty() {
            // Indices
            let mut indices = String::from("  ");
            for i in 0..j.jugador_actual().campo.len() {
                indices.push_str(&format!("[{}]           ", i));
            }
            println!("{}", indices.blue());

            let cartas_lineas: Vec<Vec<String>> = j
                .jugador_actual()
                .campo
                .iter()
                .map(|c| self.dibujar_carta_mini(c))
                .collect();

            for row in 0..5 {
                let mut linea = String::from("  ");
                for carta_lineas in &cartas_lineas {
                    if row < carta_lineas.len() {
                        linea.push_str(&carta_lineas[row]);
                        linea.push(' ');
                    }
                }
                println!("{}", linea);
            }
        } else {
            println!("  {}", "(vacío)".dimmed());
        }

        if !j.jugador_actual().lugares.is_empty() {
            let nombres: Vec<&str> = j.jugador_actual().lugares.iter().map(|c| c.nombre.as_str()).collect();
            println!("  Lugares: {}", nombres.join(", ").magenta());
        }

        // Jugador actual
        println!();
        println!(
            "  {} {} (TU TURNO) {}",
            "===".green(),
            j.jugador_actual().nombre.green().bold(),
            "===".green()
        );
        println!(
            "  ❤️  HP: {}/{}   🫘 Cacao: {}   📚 Mazo: {}",
            j.jugador_actual().hp,
            j.jugador_actual().hp_max,
            j.jugador_actual().cacao,
            j.jugador_actual().mazo.len()
        );

        // Mano
        println!();
        println!("  {}", "Tu mano:".bold());
        if !j.jugador_actual().mano.is_empty() {
            for (i, carta) in j.jugador_actual().mano.iter().enumerate() {
                let puede = if j.jugador_actual().cacao >= carta.costo {
                    "✓".green()
                } else {
                    "✗".red()
                };
                let tipo = carta.tipo.abreviatura();
                println!(
                    "  [{}] {} {} ({}) - Costo: {}",
                    i, puede, carta.nombre, tipo, carta.costo
                );
            }
        } else {
            println!("  {}", "(mano vacía)".dimmed());
        }

        // Log
        println!();
        println!("  {}", "--- Registro ---".cyan());
        for msg in j.log.iter().rev().take(5).rev() {
            println!("  > {}", msg);
        }

        println!();
        println!("{}", "=".repeat(ancho));
    }

    fn mostrar_menu(&self) {
        println!();
        println!(
            "  {}: {}",
            "Fase".bold(),
            self.juego.fase.nombre()
        );
        println!();
        println!("  Acciones:");
        println!("  [1] Jugar carta de la mano");
        println!("  [2] Atacar con una criatura");
        println!("  [3] Usar habilidad especial");
        println!("  [4] Ver carta en detalle");
        println!("  [5] Pasar turno");
        println!("  [0] Salir del juego");
    }

    fn leer_entrada(&self, prompt: &str) -> String {
        print!("\n  {}: ", prompt);
        io::stdout().flush().ok();
        let mut input = String::new();
        io::stdin().read_line(&mut input).ok();
        input.trim().to_string()
    }

    fn leer_numero(&self, prompt: &str) -> Option<usize> {
        let input = self.leer_entrada(prompt);
        input.parse().ok()
    }

    fn mostrar_carta_detalle(&self, carta: &Carta) {
        let ancho = 32;
        let emoji = carta.tipo.emoji();

        println!();
        println!("  ╔{}╗", "═".repeat(ancho - 2));
        println!("  ║ {} {:<width$} ║", emoji, carta.nombre, width = ancho - 6);
        println!("  ╠{}╣", "═".repeat(ancho - 2));

        if let Some(ref stats) = carta.stats {
            println!("  ║ 💪 Fuerza:      {:>3}          ║", carta.get_fuerza());
            println!(
                "  ║ 🛡️  Resistencia: {}/{}          ║",
                stats.resistencia, stats.resistencia_max
            );
            println!("  ║ 🫘 Producción:  {:>3}          ║", stats.produccion);
            println!("  ║ ⚡ Velocidad:   {:>3}          ║", stats.velocidad);
            println!(
                "  ║ ✨ Espíritu:    {}/{}          ║",
                stats.espiritu, stats.espiritu_max
            );
        }

        println!("  ╠{}╣", "═".repeat(ancho - 2));
        println!("  ║ Costo: {} cacao{:>width$}║", carta.costo, "", width = ancho - 17);

        if let Some(ref hab) = carta.habilidad {
            println!("  ╠{}╣", "═".repeat(ancho - 2));
            println!(
                "  ║ ⭐ {} ({}✨){:>width$}║",
                hab.nombre,
                hab.costo_espiritu,
                "",
                width = ancho - 10 - hab.nombre.len() - 3
            );
            let desc: String = hab.descripcion.chars().take(ancho - 4).collect();
            println!("  ║ {:<width$} ║", desc, width = ancho - 4);
        }

        if let Some(ref efecto) = carta.efecto {
            println!("  ╠{}╣", "═".repeat(ancho - 2));
            let efecto_str = match efecto {
                EfectoCarta::GanarCacao(n) => format!("+{} cacao", n),
                EfectoCarta::GanarCacaoYRobar(c, r) => format!("+{} cacao, +{} carta", c, r),
                EfectoCarta::DanoATodos(n) => format!("{} daño a todos", n),
                EfectoCarta::ProduccionExtra(n) => format!("+{} producción", n),
            };
            println!("  ║ {:<width$} ║", efecto_str, width = ancho - 4);
        }

        println!("  ╚{}╝", "═".repeat(ancho - 2));
    }

    fn ejecutar_turno(&mut self) {
        // Fase de producción
        if self.juego.fase == Fase::Produccion {
            self.juego.fase_produccion();
        }

        // Fase de robar
        if self.juego.fase == Fase::Robar {
            self.juego.fase_robar();
        }

        // Loop principal
        while self.juego.fase == Fase::Jugar && !self.juego.juego_terminado {
            self.limpiar_pantalla();
            self.dibujar_campo();
            self.mostrar_menu();

            let opcion = self.leer_entrada("Elige acción");

            match opcion.as_str() {
                "1" => self.accion_jugar_carta(),
                "2" => self.accion_atacar(),
                "3" => self.accion_habilidad(),
                "4" => self.accion_ver_carta(),
                "5" => {
                    self.juego.cambiar_turno();
                    return;
                }
                "0" => {
                    println!("\n  Saliendo del juego...");
                    self.juego.juego_terminado = true;
                    return;
                }
                _ => {
                    self.juego.agregar_log("Opción inválida");
                }
            }
        }
    }

    fn accion_jugar_carta(&mut self) {
        if self.juego.jugador_actual().mano.is_empty() {
            self.juego.agregar_log("No tienes cartas en mano!");
            return;
        }

        let input = self.leer_entrada("Índice de carta (o 'c' para cancelar)");
        if input.to_lowercase() == "c" {
            return;
        }

        if let Ok(idx) = input.parse::<usize>() {
            if !self.juego.jugar_carta(idx) {
                self.juego.agregar_log("No puedes jugar esa carta!");
            }
        } else {
            self.juego.agregar_log("Índice inválido!");
        }
    }

    fn accion_atacar(&mut self) {
        if self.juego.jugador_actual().campo.is_empty() {
            self.juego.agregar_log("No tienes criaturas!");
            return;
        }

        let atacantes: Vec<(usize, &Carta)> = self
            .juego
            .jugador_actual()
            .campo
            .iter()
            .enumerate()
            .filter(|(_, c)| c.puede_atacar && c.es_criatura())
            .collect();

        if atacantes.is_empty() {
            self.juego.agregar_log("Ninguna criatura puede atacar!");
            return;
        }

        println!("\n  Criaturas que pueden atacar:");
        for (i, c) in &atacantes {
            println!("  [{}] {} (Fuerza: {})", i, c.nombre, c.get_fuerza());
        }

        let input = self.leer_entrada("Índice del atacante (o 'c' para cancelar)");
        if input.to_lowercase() == "c" {
            return;
        }

        if let Ok(idx_atk) = input.parse::<usize>() {
            if !self.juego.puede_atacar(idx_atk) {
                self.juego.agregar_log("Esa criatura no puede atacar!");
                return;
            }

            println!("\n  Objetivos:");
            println!("  [J] Atacar a {} directamente", self.juego.oponente().nombre);
            for (i, c) in self.juego.oponente().campo.iter().enumerate() {
                if let Some(ref stats) = c.stats {
                    println!("  [{}] {} (Resistencia: {})", i, c.nombre, stats.resistencia);
                }
            }

            let objetivo = self.leer_entrada("Objetivo (J para jugador, número para criatura)");

            if objetivo.to_lowercase() == "j" {
                self.juego.atacar_jugador(idx_atk);
            } else if objetivo.to_lowercase() != "c" {
                if let Ok(idx_def) = objetivo.parse::<usize>() {
                    self.juego.atacar_criatura(idx_atk, idx_def);
                }
            }
        }
    }

    fn accion_habilidad(&mut self) {
        let habilidosos: Vec<(usize, &Carta)> = self
            .juego
            .jugador_actual()
            .campo
            .iter()
            .enumerate()
            .filter(|(i, _)| self.juego.puede_usar_habilidad(*i))
            .collect();

        if habilidosos.is_empty() {
            self.juego.agregar_log("Ninguna criatura puede usar habilidad!");
            return;
        }

        println!("\n  Criaturas con habilidad disponible:");
        for (i, c) in &habilidosos {
            if let Some(ref hab) = c.habilidad {
                println!("  [{}] {}: {} ({}✨)", i, c.nombre, hab.nombre, hab.costo_espiritu);
            }
        }

        let input = self.leer_entrada("Índice de criatura (o 'c' para cancelar)");
        if input.to_lowercase() == "c" {
            return;
        }

        if let Ok(idx) = input.parse::<usize>() {
            if idx >= self.juego.jugador_actual().campo.len() {
                self.juego.agregar_log("Índice inválido!");
                return;
            }

            let carta = &self.juego.jugador_actual().campo[idx];
            if let Some(ref hab) = carta.habilidad {
                if matches!(hab.efecto, EfectoHabilidad::BuffAliadoFuerza(_)) {
                    let aliados: Vec<(usize, &Carta)> = self
                        .juego
                        .jugador_actual()
                        .campo
                        .iter()
                        .enumerate()
                        .filter(|(i, _)| *i != idx)
                        .collect();

                    if aliados.is_empty() {
                        self.juego.agregar_log("No hay aliados para el buff!");
                        return;
                    }

                    println!("\n  Elige aliado para el buff:");
                    for (i, c) in &aliados {
                        println!("  [{}] {}", i, c.nombre);
                    }

                    if let Some(obj) = self.leer_numero("Índice del aliado") {
                        self.juego.usar_habilidad(idx, Some(obj));
                    }
                } else {
                    self.juego.usar_habilidad(idx, None);
                }
            }
        }
    }

    fn accion_ver_carta(&mut self) {
        println!("\n  [M] Ver carta de tu mano");
        println!("  [C] Ver carta de tu campo");
        println!("  [E] Ver carta del campo enemigo");

        let tipo = self.leer_entrada("¿Qué quieres ver?").to_lowercase();

        match tipo.as_str() {
            "m" if !self.juego.jugador_actual().mano.is_empty() => {
                for (i, c) in self.juego.jugador_actual().mano.iter().enumerate() {
                    println!("  [{}] {}", i, c.nombre);
                }
                if let Some(idx) = self.leer_numero("Índice") {
                    if idx < self.juego.jugador_actual().mano.len() {
                        self.mostrar_carta_detalle(&self.juego.jugador_actual().mano[idx]);
                        self.leer_entrada("Presiona Enter para continuar");
                    }
                }
            }
            "c" if !self.juego.jugador_actual().campo.is_empty() => {
                for (i, c) in self.juego.jugador_actual().campo.iter().enumerate() {
                    println!("  [{}] {}", i, c.nombre);
                }
                if let Some(idx) = self.leer_numero("Índice") {
                    if idx < self.juego.jugador_actual().campo.len() {
                        self.mostrar_carta_detalle(&self.juego.jugador_actual().campo[idx]);
                        self.leer_entrada("Presiona Enter para continuar");
                    }
                }
            }
            "e" if !self.juego.oponente().campo.is_empty() => {
                for (i, c) in self.juego.oponente().campo.iter().enumerate() {
                    println!("  [{}] {}", i, c.nombre);
                }
                if let Some(idx) = self.leer_numero("Índice") {
                    if idx < self.juego.oponente().campo.len() {
                        self.mostrar_carta_detalle(&self.juego.oponente().campo[idx]);
                        self.leer_entrada("Presiona Enter para continuar");
                    }
                }
            }
            _ => {}
        }
    }

    fn mostrar_titulo(&self) {
        self.limpiar_pantalla();
        println!(
            "{}",
            r#"

    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║     ██████╗██╗  ██╗ ██████╗  ██████╗ ██████╗              ║
    ║    ██╔════╝██║  ██║██╔═══██╗██╔════╝██╔═══██╗             ║
    ║    ██║     ███████║██║   ██║██║     ██║   ██║             ║
    ║    ██║     ██╔══██║██║   ██║██║     ██║   ██║             ║
    ║    ╚██████╗██║  ██║╚██████╔╝╚██████╗╚██████╔╝             ║
    ║     ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝              ║
    ║                                                           ║
    ║    ███████╗███████╗███████╗██████╗  █████╗                ║
    ║    ██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗               ║
    ║    ███████╗█████╗  █████╗  ██████╔╝███████║               ║
    ║    ╚════██║██╔══╝  ██╔══╝  ██╔══██╗██╔══██║               ║
    ║    ███████║██║     ███████╗██║  ██║██║  ██║               ║
    ║    ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝               ║
    ║                                                           ║
    ║              🌳 TCG - Trading Card Game 🍫               ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝

    "#
            .green()
        );

        println!("    Cada Guardián representa un árbol de cacao real.");
        println!("    Conecta con la naturaleza mientras juegas.");
        println!();
        println!("    {}", "Condiciones de victoria:".yellow().bold());
        println!("    • Reducir los HP del oponente a 0");
        println!("    • Tener 3 Guardianes en el campo");
        println!();
    }

    fn mostrar_victoria(&self) {
        self.limpiar_pantalla();

        let ganador_nombre = match self.juego.ganador {
            Some(1) => &self.juego.jugador1.nombre,
            Some(2) => &self.juego.jugador2.nombre,
            _ => "Nadie",
        };

        println!(
            "{}",
            r#"

    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║                    🏆 VICTORIA 🏆                        ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝

            "#
            .yellow()
        );

        println!("                    {}", ganador_nombre.green().bold());
        println!("                    ¡Ha ganado!");
        println!();
        println!("  Estadísticas finales:");
        println!(
            "  {}: {} HP, {} Guardianes",
            self.juego.jugador1.nombre,
            self.juego.jugador1.hp,
            self.juego.jugador1.contar_guardianes()
        );
        println!(
            "  {}: {} HP, {} Guardianes",
            self.juego.jugador2.nombre,
            self.juego.jugador2.hp,
            self.juego.jugador2.contar_guardianes()
        );
        println!("  Turnos totales: {}", self.juego.turno);
    }

    fn ejecutar(&mut self) {
        self.mostrar_titulo();

        let nombre1 = {
            let input = self.leer_entrada("Nombre del Jugador 1");
            if input.is_empty() { "Jugador 1".to_string() } else { input }
        };

        let nombre2 = {
            let input = self.leer_entrada("Nombre del Jugador 2");
            if input.is_empty() { "Jugador 2".to_string() } else { input }
        };

        self.juego = Juego::new(&nombre1, &nombre2);

        while !self.juego.juego_terminado {
            self.ejecutar_turno();

            if self.juego.verificar_victoria() {
                break;
            }
        }

        self.mostrar_victoria();
        self.leer_entrada("Presiona Enter para salir");
    }
}

// ============================================
// PUNTO DE ENTRADA
// ============================================

fn main() {
    let mut interfaz = Interfaz::new("Jugador 1", "Jugador 2");
    interfaz.ejecutar();
}
