use serde_json::Value;
use std::collections::HashMap;
use std::sync::OnceLock;
use tracing::warn;

static LOCALES: OnceLock<HashMap<String, Value>> = OnceLock::new();

const IT_JSON: &str = include_str!("../../locales/it.json");
const EN_JSON: &str = include_str!("../../locales/en.json");
const ES_JSON: &str = include_str!("../../locales/es.json");

fn locales() -> &'static HashMap<String, Value> {
    LOCALES.get_or_init(|| {
        let mut map = HashMap::new();
        map.insert("it".to_string(), serde_json::from_str(IT_JSON).unwrap());
        map.insert("en".to_string(), serde_json::from_str(EN_JSON).unwrap());
        map.insert("es".to_string(), serde_json::from_str(ES_JSON).unwrap());
        map
    })
}

const DEFAULT_LANG: &str = "es";

pub fn t(lang_code: &str, key: &str, vars: &[(&str, &str)]) -> String {
    let lang = normalize_lang(lang_code);
    let locales = locales();

    let text = locales
        .get(lang)
        .and_then(|v| v.get(key))
        .and_then(|v| v.as_str())
        .or_else(|| {
            locales
                .get(DEFAULT_LANG)
                .and_then(|v| v.get(key))
                .and_then(|v| v.as_str())
        });

    match text {
        Some(t) => substitute(t, vars),
        None => {
            warn!("i18n key not found: {}", key);
            key.to_string()
        }
    }
}

pub fn get_lang(language_code: Option<&str>) -> &str {
    match language_code {
        Some(code) => normalize_lang(code),
        None => DEFAULT_LANG,
    }
}

fn normalize_lang(code: &str) -> &'static str {
    let base = code.split('-').next().unwrap_or(DEFAULT_LANG);
    match base {
        "it" => "it",
        "en" => "en",
        "es" => "es",
        _ => DEFAULT_LANG,
    }
}

fn substitute(template: &str, vars: &[(&str, &str)]) -> String {
    let mut result = template.to_string();
    for (name, value) in vars {
        let compact = format!("${{{}}}", name);
        result = result.replace(&compact, value);
        let spaced = format!("${{ {} }}", name);
        result = result.replace(&spaced, value);
    }
    result
}
