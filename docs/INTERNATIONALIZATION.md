# Guía de Internacionalización - Chocósfera

**Fecha**: 15 de Octubre de 2025
**Framework**: next-intl
**Idiomas soportados**: Español (es), Inglés (en), Italiano (it)

---

## 📖 Índice

1. [Estructura de Traducciones](#estructura-de-traducciones)
2. [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
3. [Casos de Uso Comunes](#casos-de-uso-comunes)
4. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
5. [Guía de Implementación](#guía-de-implementación)
6. [Estado Actual](#estado-actual)

---

## Estructura de Traducciones

### Ubicación de Archivos

```
messages/
├── es.json    # Español (idioma base)
├── en.json    # Inglés
└── it.json    # Italiano
```

### Jerarquía de Traducciones

```json
{
  "header": { ... },
  "hero": { ... },
  "navigation": { ... },
  "dashboard": {
    "sidebar": { ... },
    "header": { ... },
    "main": { ... },
    "pricing": {
      "badge": "...",
      "title": "...",
      "schemes": {
        "seed": {
          "name": "...",
          "plans": {
            "sprout": {
              "name": "...",
              "features": ["...", "..."]
            }
          }
        }
      }
    },
    "explore": {
      "canonCharacters": {
        "title": "...",
        "pipo": {
          "name": "...",
          "description": "..."
        }
      }
    }
  }
}
```

---

## Patrones y Mejores Prácticas

### 1. Uso de `useTranslations` Hook

#### Básico
```typescript
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('dashboard.pricing');

  return <h1>{t('title')}</h1>;
}
```

#### Namespace Anidado
```typescript
// ✅ CORRECTO - Usar path completo cuando está anidado
const t = useTranslations('dashboard.pricing');

// ❌ INCORRECTO - No funciona si está anidado en dashboard
const t = useTranslations('pricing');
```

### 2. Claves Dinámicas

```typescript
// Template literals para claves dinámicas
const planName = t(`schemes.${schemeId}.plans.${planId}.name`);

// Ejemplo real del código
{t(`schemes.${scheme.id}.plans.${plan.id.replace(`${scheme.id}-`, '')}.name`)}
```

### 3. Arrays en Traducciones

```json
{
  "features": [
    "Newsletter mensual exclusivo",
    "Acceso anticipado a nuevas funciones",
    "Badge de Early Adopter"
  ]
}
```

```typescript
// Usar t.raw() para obtener arrays
const features = t.raw('features') as string[];

// Mapear el array
{features.map((feature, index) => (
  <li key={index}>{feature}</li>
))}
```

### 4. Interpolación de Variables

```json
{
  "welcome": "Bienvenido {name}",
  "itemCount": "Tienes {count} items"
}
```

```typescript
{t('welcome', { name: userName })}
{t('itemCount', { count: items.length })}
```

### 5. Pluralización

```typescript
// Usar operador ternario para plurales
{count} {count === 1 ? t('results.character') : t('results.charactersPlural')}

// JSON
{
  "results": {
    "character": "personaje",
    "charactersPlural": "personajes"
  }
}
```

---

## Casos de Uso Comunes

### Página con Múltiples Secciones

```typescript
// pricing/page.tsx
const t = useTranslations('dashboard.pricing');

// Header
<h1>{t('title')} <span>{t('titleHighlight')}</span></h1>
<p>{t('subtitle')}</p>

// Iterando esquemas
{schemes.map(scheme => (
  <div key={scheme.id}>
    <h2>{t(`schemes.${scheme.id}.name`)}</h2>
    <p>{t(`schemes.${scheme.id}.description`)}</p>
  </div>
))}
```

### Componente con Estados Dinámicos

```typescript
// Botón con estados
<button disabled={isLoading}>
  {isLoading ? t('processing') : t('subscribeNow')}
</button>

// Condicional por tipo
<span className="badge">
  {plan.interval === 'month' ? t('perMonth') : t('perYear')}
</span>
```

### Listas de Features

```typescript
// JSON
{
  "schemes": {
    "seed": {
      "plans": {
        "sprout": {
          "features": [
            "Newsletter mensual exclusivo",
            "Acceso anticipado a nuevas funciones"
          ]
        }
      }
    }
  }
}

// Component
{(t.raw(`schemes.${scheme.id}.plans.${planId}.features`) as string[]).map((feature, index) => (
  <li key={index}>
    <CheckIcon />
    {feature}
  </li>
))}
```

---

## Errores Comunes y Soluciones

### Error 1: MISSING_MESSAGE

**Error**:
```
MISSING_MESSAGE: Could not resolve `pricing` in messages for locale `it`.
```

**Causa**: Intentando acceder a una clave que no existe o usando namespace incorrecto.

**Solución**:
```typescript
// ❌ MAL
const t = useTranslations('pricing');

// ✅ BIEN - usar path completo
const t = useTranslations('dashboard.pricing');
```

### Error 2: INSUFFICIENT_PATH

**Error**:
```
INSUFFICIENT_PATH: Message at `dashboard.marketplace.products` resolved to an object, but only strings are supported.
```

**Causa**: Clave duplicada en JSON. JavaScript solo mantiene la última definición.

```json
// ❌ MAL - última clave sobrescribe
{
  "products": "productos",
  "products": { "nft001": {...} }
}
```

**Solución**: Usar nombres únicos y descriptivos
```json
// ✅ BIEN
{
  "productsCount": "productos",
  "items": { "nft001": {...} }
}
```

### Error 3: Arrays no Tipados

**Error**: TypeScript no reconoce que `t('features')` es un array.

**Solución**:
```typescript
// ✅ Usar t.raw() con type assertion
const features = t.raw('features') as string[];
```

---

## Guía de Implementación

### Paso 1: Planificar Estructura

Antes de implementar, definir estructura de traducciones:

```
dashboard.pricing
├── badge
├── title
├── titleHighlight
├── subtitle
├── metrics
│   ├── trees
│   ├── chococoins
│   └── discount
└── schemes
    ├── seed
    │   ├── name
    │   ├── description
    │   └── plans
    └── fruit
        └── ...
```

### Paso 2: Crear Traducciones

1. **Empezar con Español** (idioma base)
2. **Traducir a Inglés** (idioma internacional)
3. **Traducir a Italiano** (tercera prioridad)

### Paso 3: Implementar en Código

```typescript
// 1. Import hook
import { useTranslations } from 'next-intl';

// 2. Initialize con namespace
const t = useTranslations('dashboard.pricing');

// 3. Reemplazar strings hardcoded
// ANTES:
<h1>Planes y Precios</h1>

// DESPUÉS:
<h1>{t('badge')}</h1>
```

### Paso 4: Testing

- [ ] Verificar en localhost con `/es/route`
- [ ] Cambiar a `/en/route` y verificar
- [ ] Cambiar a `/it/route` y verificar
- [ ] Revisar console por errores de next-intl
- [ ] Verificar que arrays rendericen correctamente
- [ ] Probar claves dinámicas con diferentes IDs

---

## Estado Actual

### ✅ Páginas Completamente Internacionalizadas

#### Landing/Home
- ✅ Header
- ✅ Hero
- ✅ Sections (cacao, blockchain, justice)
- ✅ CTA
- ✅ Navigation
- ✅ Footer

#### Authentication
- ✅ Login
- ✅ Register
- ✅ Forgot Password

#### Dashboard Core
- ✅ Sidebar
- ✅ Header
- ✅ Main Dashboard
- ✅ User Profile

#### Dashboard Secciones
- ✅ **Pricing** (Sesión 4 - 15 Oct 2025)
  - Dual scheme support
  - FAQ section
  - Multi-plan selection
  - Error messages
- ✅ **Explore** (Sesión 4 - 15 Oct 2025)
  - Canon Characters section
  - Character/Story tabs
  - Empty states
  - Search placeholder
- ✅ Marketplace
- ✅ Family
- ✅ Characters
- ✅ Community
- ✅ Settings
- ✅ Impact
- ✅ Traceability
- ✅ Trees

### 📊 Estadísticas

- **Total líneas de traducción por idioma**: ~1,000+ líneas
- **Secciones traducidas**: 15+
- **Idiomas soportados**: 3 (ES, EN, IT)
- **Páginas sin traducir**: 0 en dashboard

### 🚧 Pendientes de Internacionalización

#### Contenido Dinámico
- [ ] Nombres de planes (actualmente hardcoded en inglés: "Seed", "Fruit")
  - Decisión: ¿Mantener nombres en inglés como marca o traducir?
- [ ] Nombres de personajes canon (Pipo, Tony, Kaoka)
  - Actualmente sin traducir por ser nombres propios
- [ ] Descripciones de productos en marketplace
  - Requiere agregar más variaciones de descripción

#### Notificaciones
- [ ] Email templates de MailerSend
- [ ] Sistema de notificaciones in-app
- [ ] Toast messages

#### Metadata SEO
- [ ] Títulos de página
- [ ] Meta descriptions
- [ ] Open Graph tags

---

## Nuevas Características Implementadas

### Canon Characters (Sesión 4)

```typescript
// explore/page.tsx líneas 289-332
{activeTab === 'characters' && !isLoading && !error && (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50...">
    <h2>{t('canonCharacters.title')}</h2>
    <p>{t('canonCharacters.subtitle')}</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pipo */}
      <div className="...">
        <h3>{t('canonCharacters.pipo.name')}</h3>
        <p>{t('canonCharacters.pipo.description')}</p>
        <button>{t('canonCharacters.forkThis')}</button>
      </div>
      {/* Tony, Kaoka similar... */}
    </div>
  </div>
)}
```

**Traducciones**:
```json
{
  "canonCharacters": {
    "title": "Personajes Canon de Chocósfera",
    "subtitle": "Los personajes oficiales que dan vida al universo del chocolate",
    "forkThis": "Haz fork de este personaje",
    "pipo": {
      "name": "Pipo",
      "description": "El pequeño brote de cacao lleno de curiosidad"
    },
    "tony": {
      "name": "Tony",
      "description": "El maestro chocolatero con corazón de oro"
    },
    "kaoka": {
      "name": "Kaoka",
      "description": "El sabio agricultor guardián del cacao"
    }
  }
}
```

### Dual Pricing Scheme (Sesión 4)

Estructura compleja con dos esquemas complementarios:

**Seed Scheme** - Para early adopters:
- Sprout (€5/mes)
- Seedling (€15/mes)
- Sapling (€50/mes)

**Fruit Scheme** - Para adopción de árboles:
- Cacao Pod (€10/mes) - 1 árbol
- Cacao Grove (€25/mes) - 3 árboles
- Cacao Forest (€80/mes) - 10 árboles

Cada plan con features traducidas en array.

---

## Referencias

### Documentación
- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

### Archivos Clave
- `i18n.ts` - Configuración de next-intl
- `middleware.ts` - Routing por locale
- `messages/*.json` - Archivos de traducción

### Commits Relacionados
```bash
# Pricing
git log --grep="pricing" --oneline

# Canon Characters
317d95b - feat: add canon characters section to explore page
```

---

## Contribuir Traducciones

### Para añadir un nuevo idioma

1. Crear archivo `messages/[locale].json`
2. Copiar estructura de `es.json`
3. Traducir todos los valores
4. Añadir locale a `i18n.ts`:
```typescript
export const locales = ['es', 'en', 'it', 'fr'] as const; // Añadir 'fr'
```
5. Actualizar middleware si necesario

### Para añadir nuevas traducciones

1. Añadir clave en `es.json` primero
2. Añadir misma clave en `en.json` y `it.json`
3. Mantener estructura consistente
4. Usar nombres descriptivos de claves
5. Evitar claves duplicadas

---

**Última actualización**: 15 de Octubre de 2025
**Autor**: Claude Code + German Lugo
**Versión**: 1.0
